'use client';

/*
CHANGES
[RESP-1] Responsive canvas scaling via ResizeObserver + CSS transform (keeps absolute coords intact).
[RESP-2] Wrapper uses the *scaled* width/height to remove mobile vertical gap (no spacer).
[RESP-3] Responsive two-column layout: canvas + thumbnails (rail vertical on desktop, horizontal scroll on mobile).
[RESP-4] Main canvas: per-row horizontal reflow with equal outside + in-between spacing; sizes & Y stay unchanged.
[RESP-5] Thumbnails: fit-to-box scaling (top-aligned) + same per-row equal spacing for clear previews.
[RESP-6] Layout picker tiles: percent-based positioning from layout bbox for proportional, consistent previews.
*/

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// ----------------- types unchanged -----------------
interface Position { x_position?: number; y_position?: number; x_coordinate?: number; y_coordinate?: number; }
interface Size { width: number; height: number; }
interface Styles { font_family?: string; font_size?: number; font_weight?: string; }
interface Editor { label: string; placeholder: string; max_characters: number; }
interface CroppingInfo { x_position: number; y_position: number; width: number; height: number; }
interface Original { url: string; cropping_info: CroppingInfo; }
interface Component {
  type: 'heading' | 'signature' | 'paragraph' | 'caption' | 'photo';
  position: Position; size: Size; styles?: Styles; editor?: Editor;
  value?: string; image_url?: string; original?: Original;
}
interface Layout { guid: string; name?: string; components: Component[]; }
interface Page { guid?: string; layout: Layout; components: Component[]; }
interface LayoutEditorProps {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  availableLayouts: Layout[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, pageIndex: number, slotIndex: number) => void;
  handleRemoveImage: (pageIndex: number, slotIndex: number) => void;
  uploading: boolean;
  error: string | null;
}

// [RESP-1] Design reference size of your canvas (kept from original 800x700)
const DESIGN_W = 800;
const DESIGN_H = 700;

const LayoutEditorPage: React.FC<LayoutEditorProps> = ({
  pages,
  setPages,
  currentPageIndex,
  setCurrentPageIndex,
  availableLayouts,
  handleFileUpload,
  handleRemoveImage,
  uploading,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewPage, setIsAddingNewPage] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [editMessageModalOpen, setEditMessageModalOpen] = useState(false);
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);
  const [tempMessage, setTempMessage] = useState<string>('');

  // [RESP-1] Responsive scale handling via ResizeObserver + CSS transform
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      // leave some breathing room on mobile; never upscale beyond 1
      const next = Math.min(width / DESIGN_W, 1);
      setScale(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleViewLayouts = () => {
    setIsAddingNewPage(false);
    setModalOpen(true);
  };

  const mapDataToNewLayout = (newLayout: Layout, currentComponents: Component[]): Component[] => {
    const newComponents = [...newLayout.components];
    const currentPhotos = currentComponents.filter(c => c.type === 'photo');
    const currentText = currentComponents.find(c => ['heading', 'signature', 'paragraph', 'caption'].includes(c.type));

    let photoIndex = 0;
    newComponents.forEach((comp, index) => {
      if (comp.type === 'photo' && photoIndex < currentPhotos.length) {
        newComponents[index] = { ...comp, image_url: currentPhotos[photoIndex].image_url, original: currentPhotos[photoIndex].original };
        photoIndex++;
      } else if (['heading', 'signature', 'paragraph', 'caption'].includes(comp.type) && currentText) {
        newComponents[index] = { ...comp, value: currentText.value };
      }
    });

    return newComponents;
  };

  const selectLayout = (layout: Layout) => {
    if (isAddingNewPage) {
      const newPage: Page = { guid: `page-${pages.length + 1}`, layout, components: layout.components };
      setPages([...pages, newPage]);
      setCurrentPageIndex(pages.length);
    } else {
      const updatedPages = [...pages];
      const currentPage = updatedPages[currentPageIndex];
      const mappedComponents = mapDataToNewLayout(layout, currentPage.components);
      updatedPages[currentPageIndex] = { ...currentPage, layout, components: mappedComponents };
      setPages(updatedPages);
    }
    setModalOpen(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedPages = Array.from(pages);
    const [movedPage] = reorderedPages.splice(result.source.index, 1);
    reorderedPages.splice(result.destination.index, 0, movedPage);
    setPages(reorderedPages);
    setCurrentPageIndex(reorderedPages.findIndex(page => page.guid === pages[currentPageIndex].guid));
  };

  const handleComponentClick = (index: number) => {
    const component = pages[currentPageIndex].components[index];
    setSelectedComponent(component);
    if (['heading', 'signature', 'paragraph', 'caption'].includes(component.type)) {
      setTempMessage(component.value || '');
      setEditMessageModalOpen(true);
    } else if (component.type === 'photo') {
      setEditPhotoModalOpen(true);
    }
  };

  const handleSaveMessage = () => {
    if (selectedComponent) {
      const updatedComponent = { ...selectedComponent, value: tempMessage };
      const updatedPages = [...pages];
      const updatedComponents = updatedPages[currentPageIndex].components.map((comp, index) =>
        index === updatedPages[currentPageIndex].components.indexOf(selectedComponent) ? updatedComponent : comp
      );
      updatedPages[currentPageIndex].components = updatedComponents;
      setPages(updatedPages);
      setEditMessageModalOpen(false);
      setSelectedComponent(null);
    }
  };

  const handleCancelMessageEdit = () => {
    setEditMessageModalOpen(false);
    setSelectedComponent(null);
    setTempMessage('');
  };

  const handleCancelPhotoEdit = () => {
    setEditPhotoModalOpen(false);
    setSelectedComponent(null);
  };

  const renderComponent = (comp: Component, index: number) => {
    if (comp.type === 'photo') {
      return (
        <div
          key={index}
          className="absolute border border-gray-300 rounded cursor-pointer flex flex-col items-center justify-center"
          style={{
            left: comp.position.x_coordinate,
            top: comp.position.y_coordinate,
            width: comp.size.width,
            height: comp.size.height,
            backgroundImage: comp.image_url ? `url(${comp.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundColor: comp.image_url ? 'transparent' : '#a3bffa',
            boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          onClick={() => handleComponentClick(index)}
        >
          {!comp.image_url && uploading && <span className="text-gray-500 text-sm">Uploading...</span>}
          {!comp.image_url && !uploading && (
            <>
              <span className="text-gray-700 text-sm mb-2">Add a Photo</span>
              <div className="text-white text-2xl">+</div>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={index}
          className="absolute border border-gray-300 rounded cursor-pointer bg-white p-2"
          style={{
            left: comp.position.x_position,
            top: comp.position.y_position,
            width: comp.size.width,
            height: comp.size.height,
            fontFamily: comp.styles?.font_family,
            fontSize: comp.styles?.font_size,
            fontWeight: comp.styles?.font_weight,
            boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          onClick={() => handleComponentClick(index)}
        >
          {comp.value || <span className="text-gray-500 text-sm">Add Text</span>}
        </div>
      );
    }
  };

  const renderThumbnail = (page: Page, pageIndex: number) => {
    const THUMB_W = 150;
    const THUMB_H = 120;

    const getX = (c: any) =>
      (c.position?.x_coordinate ?? c.position?.x_position ?? 0) as number;
    const getY = (c: any) =>
      (c.position?.y_coordinate ?? c.position?.y_position ?? 0) as number;

    if (!page.components?.length) {
      return (
        <div className="relative w-[150px] h-[120px] bg-gray-100 border border-gray-300 rounded" />
      );
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const c of page.components) {
      const x = getX(c);
      const y = getY(c);
      const w = c.size?.width ?? 0;
      const h = c.size?.height ?? 0;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }

    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);

    const INSET = 6;
    const scale = Math.min(
      (THUMB_W - INSET * 2) / contentW,
      (THUMB_H - INSET * 2) / contentH,
      1
    );

    // vertical stays aligned from top
    const offsetY = INSET;

    // group components by their row (approx same y after scaling)
    const rowTolerance = 5; // px tolerance to consider items on same row
    const scaledComps = page.components.map((comp) => {
      const x = getX(comp);
      const y = getY(comp);
      const w = comp.size?.width ?? 0;
      const h = comp.size?.height ?? 0;
      return {
        ...comp,
        scaledX: (x - minX) * scale,
        scaledY: (y - minY) * scale,
        scaledW: Math.max(1, w * scale),
        scaledH: Math.max(1, h * scale),
      };
    });

    const rows: any[][] = [];
    scaledComps.forEach((c) => {
      let row = rows.find(
        (r) => Math.abs(r[0].scaledY - c.scaledY) < rowTolerance
      );
      if (!row) {
        row = [];
        rows.push(row);
      }
      row.push(c);
    });

    // sort rows top → bottom, and items left → right
    rows.sort((a, b) => a[0].scaledY - b[0].scaledY);
    rows.forEach((row) => row.sort((a, b) => a.scaledX - b.scaledX));

    // [RESP-5] Thumbs: adjust horizontal positions for equal spacing (outer + inner)
    rows.forEach((row) => {
      const totalW = row.reduce((sum, c) => sum + c.scaledW, 0);
      const availableW = THUMB_W - INSET * 2;
      const gapCount = row.length + 1; // left + between + right
      const gap = (availableW - totalW) / gapCount;

      let x = INSET + gap; // start after first outer gap
      row.forEach((c) => {
        c.scaledX = x;
        c.scaledY = c.scaledY + offsetY; // keep top alignment
        x += c.scaledW + gap;
      });
    });

    return (
      <div className="relative w-[150px] h-[120px] bg-gray-100 border border-gray-300 rounded">
        {scaledComps.map((comp, compIndex) => (
          <div
            key={`${pageIndex}-${compIndex}`}
            className="absolute border border-gray-400 rounded flex items-center justify-center"
            style={{
              left: comp.scaledX,
              top: comp.scaledY,
              width: comp.scaledW,
              height: comp.scaledH,
              backgroundColor: comp.type === "photo" ? "#a3bffa" : "#e0e0e0",
              backgroundImage:
                comp.type === "photo" && comp.image_url
                  ? `url(${comp.image_url})`
                  : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            {comp.type === "photo" && !comp.image_url && (
              <div className="text-white text-sm">+</div>
            )}
          </div>
        ))}
      </div>
    );
  };


  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
    setCurrentPageIndex(Math.min(index, updatedPages.length - 1));
  };

  // [RESP-3] Layout wrapper: grid on lg+, stacked on small (thumbnails rail responsive)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px] gap-4 mx-auto w-full max-w-[1000px]">
      {/* Canvas column */}
      <div className="w-full">
        {/* [RESP-2] Wrapper uses the *scaled* size; removes mobile vertical gap */}
        <div ref={containerRef} className="w-full">
          <div
            className="relative border border-gray-300 bg-gray-100 rounded-lg shadow-sm overflow-hidden"
            style={{
              width: Math.round(DESIGN_W * scale),      // [RESP-2] scaled wrapper width
              height: Math.round(DESIGN_H * scale),     // [RESP-2] scaled wrapper height
            }}
          >
            {/* [RESP-1] Unscaled design canvas; only visually scaled via CSS transform */}
            <div
              className="absolute top-0 left-0"
              style={{
                width: DESIGN_W,
                height: DESIGN_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {(() => {
                // [RESP-4] MAIN CANVAS: equal outside + in-between horizontal spacing per row
                // - Keep sizes and Y positions unchanged; only recompute LEFTs per row.

                const components = pages[currentPageIndex]?.components ?? [];

                const getX = (c: any) => (c.position?.x_coordinate ?? c.position?.x_position ?? 0) as number;
                const getY = (c: any) => (c.position?.y_coordinate ?? c.position?.y_position ?? 0) as number;
                const getW = (c: any) => (c.size?.width ?? 0) as number;
                const setX = (c: any, x: number) => {
                  c.position = { ...(c.position ?? {}), x_coordinate: x, x_position: x };
                };

                const ROW_TOL = 8; // group items in a row if Y is close

                // clone with index
                const indexed = components.map((c, i) => ({ c, i, y: getY(c), x: getX(c) }));
                indexed.sort((a, b) => (a.y - b.y) || (a.x - b.x));

                // group into rows
                const rows: Array<typeof indexed> = [];
                indexed.forEach((item) => {
                  const row = rows.find(r => Math.abs(getY(r[0].c) - item.y) < ROW_TOL);
                  if (row) row.push(item);
                  else rows.push([item]);
                });

                rows.forEach((row) => {
                  row.sort((a, b) => getX(a.c) - getX(b.c));

                  // --- FIX: if a row has exactly one NON-photo (e.g., Message Only),
                  //           expand it to fill the row with comfortable side padding. ---
                  if (row.length === 1 && row[0].c.type !== 'photo') {
                    const PAD = 40;
                    row[0].c.size = { ...row[0].c.size, width: Math.max(1, DESIGN_W - PAD * 2) };
                    setX(row[0].c, PAD);
                    return;
                  }

                  const sumW = row.reduce((s, it) => s + getW(it.c), 0);
                  const gaps = row.length + 1; // left + between + right
                  const gap = (DESIGN_W - sumW) / gaps;

                  let cursorX = gap; // first outer gap
                  row.forEach((it) => {
                    setX(it.c, cursorX);        // assign new left pos (equal outer + inner spacing)
                    cursorX += getW(it.c) + gap;
                  });
                });

                // restore original order
                const adjusted = new Array(indexed.length);
                indexed.forEach(({ c, i }) => (adjusted[i] = c));

                return adjusted.map((comp: any, index: number) => renderComponent(comp, index));
              })()}

              {/* Delete button (UNCHANGED) */}
              {pages.length > 1 && (
                <button
                  onClick={() => handleDeletePage(currentPageIndex)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
                  style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top right' }}
                  aria-label="Delete page"
                  title="Delete page"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>


        <div className="flex justify-between mt-4">
          <button onClick={handleViewLayouts} className="text-purple-600 hover:underline text-sm">
            View other layouts
          </button>
        </div>
      </div>

      {/* Thumbnails column */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pages" isCombineEnabled={false} isDropDisabled={false} direction="vertical">
          {(provided) => (
            // [RESP-3] On mobile: horizontal scroller; on lg+: vertical list with fixed width
            <div
              className="lg:w-[200px] lg:max-h-[700px] lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden flex lg:block gap-2 pb-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pages.map((page, index) => (
                <Draggable key={page.guid || `p-${index}`} draggableId={page.guid || `p-${index}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`cursor-pointer border-2 ${index === currentPageIndex ? 'border-purple-600' : 'border-transparent'
                        } rounded lg:mb-2 shrink-0`}
                      onClick={() => setCurrentPageIndex(index)}
                      // on small screens each thumb has fixed width to enable horizontal scroll
                      style={{ width: 160 }}
                    >
                      {renderThumbnail(page, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* MODALS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Pick a Layout</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Click a layout below to use it!</p>

            {/* responsive grid (UNCHANGED) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableLayouts.map((layout) => {
                const previewComponents = isAddingNewPage
                  ? layout.components
                  : mapDataToNewLayout(layout, pages[currentPageIndex].components);

                // [RESP-6] Compute bbox and position children by PERCENTAGES for proportional preview
                const getX = (c: any) => (c.position?.x_coordinate ?? c.position?.x_position ?? 0) as number;
                const getY = (c: any) => (c.position?.y_coordinate ?? c.position?.y_position ?? 0) as number;

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (const c of previewComponents) {
                  const x = getX(c), y = getY(c);
                  const w = c.size?.width ?? 0, h = c.size?.height ?? 0;
                  minX = Math.min(minX, x);
                  minY = Math.min(minY, y);
                  maxX = Math.max(maxX, x + w);
                  maxY = Math.max(maxY, y + h);
                }
                const contentW = Math.max(1, maxX - minX);
                const contentH = Math.max(1, maxY - minY);

                // Inset keeps a small margin inside each preview box (top-aligned)
                const INSET = 6;

                return (
                  <button
                    key={layout.guid}
                    className="cursor-pointer border border-gray-300 p-3 rounded hover:border-purple-600 w-full text-left"
                    onClick={() => selectLayout(layout)}
                  >
                    <h3 className="text-xs font-semibold text-gray-800 mb-2 text-center">{layout.name}</h3>

                    {/* Preview box remains responsive; height is fixed to 120px */}
                    <div className="relative w-full h-[120px] bg-gray-100 rounded">
                      {/* [RESP-6] Inner canvas: percentage-based placement from bbox */}
                      <div
                        className="absolute"
                        style={{ left: INSET, top: INSET, right: INSET, bottom: INSET }}
                      >
                        {previewComponents.map((comp, index) => {
                          const x = getX(comp);
                          const y = getY(comp);
                          const w = comp.size?.width ?? 0;
                          const h = comp.size?.height ?? 0;

                          // Percentages from bbox (no fixed /4 scaling)
                          const leftPct = ((x - minX) / contentW) * 100;
                          const topPct = ((y - minY) / contentH) * 100;
                          const widthPct = (w / contentW) * 100;
                          const heightPct = (h / contentH) * 100;

                          return (
                            <div
                              key={index}
                              className="absolute border border-gray-400 rounded flex items-center justify-center"
                              style={{
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                width: `${widthPct}%`,
                                height: `${heightPct}%`,

                                // visuals (unchanged)
                                backgroundColor: comp.type === 'photo' ? '#a3bffa' : '#e0e0e0',
                                backgroundImage:
                                  comp.type === 'photo' && comp.image_url ? `url(${comp.image_url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                              }}
                            >
                              {comp.type === 'photo' && !comp.image_url && <div className="text-white text-lg">+</div>}
                              {comp.type !== 'photo' && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-500 text-[10px]">Text</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">Add</button>
            </div>
          </div>
        </div>
      )}

      {editMessageModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Message</h2>
              <button onClick={handleCancelMessageEdit} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="relative">
              <textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                placeholder={selectedComponent.editor?.placeholder || 'Enter your message'}
                maxLength={507}
                className="w-full p-2 border border-gray-300 rounded text-sm mb-2 h-32 resize-none"
              />
              <div className="text-right text-gray-500 text-xs">{tempMessage.length}/507</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelMessageEdit} className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800">Cancel</button>
              <button onClick={handleSaveMessage} className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {editPhotoModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Photo</h2>
              <button onClick={handleCancelPhotoEdit} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {selectedComponent.image_url ? (
              <div className="mb-4">
                <Image
                  src={selectedComponent.image_url}
                  alt="Uploaded photo"
                  width={300}
                  height={200}
                  className="object-cover rounded border border-gray-300"
                />
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4">No photo added yet.</p>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <label className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-300">
                Replace Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (selectedComponent) {
                      const slotIndex = pages[currentPageIndex].components.indexOf(selectedComponent);
                      handleFileUpload(e, currentPageIndex, slotIndex);
                    }
                    setEditPhotoModalOpen(false);
                  }}
                />
              </label>

              {selectedComponent.image_url && (
                <button
                  className="px-4 py-2 text-red-600 hover:text-red-800 text-sm"
                  onClick={() => {
                    if (selectedComponent) {
                      const slotIndex = pages[currentPageIndex].components.indexOf(selectedComponent);
                      handleRemoveImage(currentPageIndex, slotIndex);
                    }
                    setEditPhotoModalOpen(false);
                  }}
                >
                  Remove Photo
                </button>
              )}

              <button onClick={handleCancelPhotoEdit} className="ml-auto px-4 py-2 text-gray-600 text-sm hover:text-gray-800">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutEditorPage;
