'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ImagePlus, LayoutGrid, Plus, Trash2, Type, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/app/stitch-landing.css';
import { v4 as uuidv4 } from 'uuid';

// Type definitions remain unchanged
interface Position {
  x_position?: number;
  y_position?: number;
  x_coordinate?: number;
  y_coordinate?: number;
}

interface Size {
  width: number;
  height: number;
}

interface Styles {
  font_family?: string;
  font_size?: number;
  font_weight?: string;
}

interface Editor {
  label: string;
  placeholder: string;
  max_characters: number;
}

interface CroppingInfo {
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}

interface Original {
  url: string;
  cropping_info: CroppingInfo;
}

interface Component {
  type: 'heading' | 'signature' | 'paragraph' | 'caption' | 'photo';
  position: Position;
  size: Size;
  styles?: Styles;
  editor?: Editor;
  value?: string;
  image_url?: string;
  original?: Original;
}

interface Layout {
  guid: string;
  name?: string;
  components: Component[];
}

interface Page {
  guid?: string;
  layout: Layout;
  components: Component[];
}

interface LayoutEditorProps {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  availableLayouts: Layout[];
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    pageIndex: number,
    slotIndex: number
  ) => void;
  handleRemoveImage: (pageIndex: number, slotIndex: number) => void;
  uploading: boolean;
  error: string | null;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 700;

function getComponentPosition(comp: Component): { left: number; top: number } {
  return {
    left: comp.position.x_coordinate ?? comp.position.x_position ?? 0,
    top: comp.position.y_coordinate ?? comp.position.y_position ?? 0,
  };
}

function getLayoutContentOffset(components: Component[]): { offsetX: number; offsetY: number } {
  if (components.length === 0) {
    return { offsetX: 0, offsetY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const comp of components) {
    const { left, top } = getComponentPosition(comp);
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, left + comp.size.width);
    maxY = Math.max(maxY, top + comp.size.height);
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  return {
    offsetX: (CANVAS_WIDTH - contentWidth) / 2 - minX,
    offsetY: (CANVAS_HEIGHT - contentHeight) / 2 - minY,
  };
}

function toCanvasPercent(
  comp: Component,
  offsetX: number,
  offsetY: number
): { left: string; top: string; width: string; height: string } {
  const { left, top } = getComponentPosition(comp);
  return {
    left: `${((left + offsetX) / CANVAS_WIDTH) * 100}%`,
    top: `${((top + offsetY) / CANVAS_HEIGHT) * 100}%`,
    width: `${(comp.size.width / CANVAS_WIDTH) * 100}%`,
    height: `${(comp.size.height / CANVAS_HEIGHT) * 100}%`,
  };
}

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
      const newPage: Page = {
        guid: uuidv4(),
        layout,
        components: JSON.parse(JSON.stringify(layout.components)) as Component[],
      };
      setPages([...pages, newPage]);
      setCurrentPageIndex(pages.length);
      setIsAddingNewPage(false);
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

  const renderComponent = (comp: Component, index: number, offsetX: number, offsetY: number) => {
    const { left, top } = getComponentPosition(comp);
    const positionedLeft = left + offsetX;
    const positionedTop = top + offsetY;

    if (comp.type === 'photo') {
      return (
        <div
          key={index}
          className={cn(
            'absolute flex cursor-pointer flex-col items-center justify-center rounded-xl transition-all duration-200',
            'hover:ring-2 hover:ring-[var(--color-primary)]/25',
            comp.image_url
              ? 'overflow-hidden bg-neutral-100 shadow-md ring-1 ring-black/5'
              : 'border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]/90'
          )}
          style={{
            left: positionedLeft,
            top: positionedTop,
            width: comp.size.width,
            height: comp.size.height,
            backgroundImage: comp.image_url ? `url(${comp.image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onClick={() => handleComponentClick(index)}
        >
          {!comp.image_url && (
            <>
              {uploading ? (
                <span className="font-body-sm text-[var(--color-on-surface-variant)]">Uploading…</span>
              ) : (
                <>
                  <ImagePlus
                    className="mb-2 h-8 w-8 text-[var(--color-primary)]/70"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="font-label-lg text-[var(--color-on-surface-variant)]">Add a photo</span>
                </>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div
        key={index}
        className={cn(
          'absolute cursor-pointer rounded-xl p-3 transition-all duration-200',
          'hover:ring-2 hover:ring-[var(--color-primary)]/25',
          comp.value
            ? 'border border-[var(--color-outline-variant)]/50 bg-white shadow-sm'
            : 'border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]'
        )}
        style={{
          left: positionedLeft,
          top: positionedTop,
          width: comp.size.width,
          height: comp.size.height,
          fontFamily: comp.styles?.font_family,
          fontSize: comp.styles?.font_size,
          fontWeight: comp.styles?.font_weight,
        }}
        onClick={() => handleComponentClick(index)}
      >
        {comp.value ? (
          <p className="line-clamp-[12] whitespace-pre-wrap font-body-md leading-relaxed text-[var(--color-on-surface)]">
            {comp.value}
          </p>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Type className="mb-2 h-7 w-7 text-[var(--color-primary)]/70" strokeWidth={1.5} aria-hidden />
            <span className="font-label-lg text-[var(--color-on-surface-variant)]">Add text</span>
          </div>
        )}
      </div>
    );
  };

  const renderThumbnail = (page: Page) => {
    const { offsetX, offsetY } = getLayoutContentOffset(page.components);

    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-[var(--color-surface-container-low)] ring-1 ring-[var(--color-outline-variant)]/40">
        {page.components.map((comp, compIndex) => {
          const box = toCanvasPercent(comp, offsetX, offsetY);
          return (
            <div
              key={compIndex}
              className={cn(
                'absolute rounded-[2px]',
                comp.type === 'photo'
                  ? 'bg-[var(--color-surface-container-high)]'
                  : 'bg-[var(--color-surface-container-lowest)] ring-1 ring-[var(--color-outline-variant)]/30'
              )}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                backgroundImage:
                  comp.type === 'photo' && comp.image_url ? `url(${comp.image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          );
        })}
      </div>
    );
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
    setCurrentPageIndex(Math.min(index, updatedPages.length - 1));
  };

  const currentComponents = pages[currentPageIndex]?.components ?? [];
  const { offsetX: canvasOffsetX, offsetY: canvasOffsetY } =
    getLayoutContentOffset(currentComponents);

  return (
    <div className="stitch-landing mx-auto flex max-w-[1040px] flex-col gap-8 lg:flex-row lg:gap-10">
      <div className="min-w-0 flex-1">
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-4 shadow-[0_12px_40px_rgba(17,28,45,0.06)] sm:p-6">
          <div className="relative mx-auto flex h-[700px] w-[800px] max-w-full items-center justify-center rounded-xl bg-[var(--color-surface)] ring-1 ring-[var(--color-outline-variant)]/30">
            {currentComponents.map((comp, index) =>
              renderComponent(comp, index, canvasOffsetX, canvasOffsetY)
            )}
            {pages.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeletePage(currentPageIndex)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--color-on-surface-variant)] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Delete page"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 px-1">
          <button
            type="button"
            onClick={handleViewLayouts}
            className="inline-flex items-center gap-2 font-label-lg text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            View other layouts
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pages" isCombineEnabled={false} isDropDisabled={false}>
          {(provided) => (
            <div
              className="flex w-full shrink-0 flex-row gap-3 overflow-x-auto pb-2 lg:w-[168px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:max-h-[760px]"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pages.map((page, index) => (
                <Draggable key={page.guid || ''} draggableId={page.guid || ''} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        'w-[140px] shrink-0 cursor-pointer rounded-xl p-1.5 transition-all lg:w-full',
                        index === currentPageIndex
                          ? 'bg-[var(--color-surface-container)] ring-2 ring-[var(--color-primary)]'
                          : 'bg-transparent ring-1 ring-transparent hover:ring-[var(--color-outline-variant)]/60'
                      )}
                      onClick={() => setCurrentPageIndex(index)}
                    >
                      <div className="mb-1 flex items-center justify-between px-1">
                        <span className="font-label-lg text-[var(--color-on-surface-variant)]">
                          Page {index + 1}
                        </span>
                      </div>
                      {renderThumbnail(page)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewPage(true);
                  setModalOpen(true);
                }}
                className="flex h-[120px] w-[140px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]/50 font-label-lg text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-container-low)] lg:h-auto lg:min-h-[100px] lg:w-full"
              >
                <Plus className="h-5 w-5" aria-hidden />
                Add page
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-2xl ring-1 ring-[var(--color-outline-variant)]/40">
            <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/30 px-6 py-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[var(--color-on-surface)]">Choose a layout</h2>
                <p className="mt-1 font-body-sm text-[var(--color-on-surface-variant)]">
                  Pick a structure for your photos and message.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setIsAddingNewPage(false);
                }}
                className="rounded-lg p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableLayouts.map((layout) => {
                const previewComponents = isAddingNewPage
                  ? layout.components
                  : mapDataToNewLayout(layout, pages[currentPageIndex].components);
                return (
                  <button
                    type="button"
                    key={layout.guid}
                    className="rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] p-4 text-left transition-all hover:border-[var(--color-primary)]/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                    onClick={() => selectLayout(layout)}
                  >
                    <h3 className="mb-3 text-center font-label-lg text-[var(--color-on-surface)]">
                      {layout.name}
                    </h3>
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[200px] overflow-hidden rounded-lg bg-[var(--color-surface-container-low)] ring-1 ring-[var(--color-outline-variant)]/30">
                      {(() => {
                        const { offsetX, offsetY } = getLayoutContentOffset(previewComponents);
                        return previewComponents.map((comp, index) => {
                          const box = toCanvasPercent(comp, offsetX, offsetY);
                          return (
                            <div
                              key={index}
                              className={cn(
                                'absolute rounded-[2px]',
                                comp.type === 'photo'
                                  ? 'bg-[var(--color-surface-container-high)]'
                                  : 'bg-[var(--color-surface-container-lowest)] ring-1 ring-[var(--color-outline-variant)]/25'
                              )}
                              style={{
                                left: box.left,
                                top: box.top,
                                width: box.width,
                                height: box.height,
                                backgroundImage:
                                  comp.type === 'photo' && comp.image_url
                                    ? `url(${comp.image_url})`
                                    : undefined,
                                backgroundSize: 'cover',
                              }}
                            />
                          );
                        });
                      })()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {editMessageModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl ring-1 ring-[var(--color-outline-variant)]/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[var(--color-on-surface)]">Your message</h2>
              <button
                type="button"
                onClick={handleCancelMessageEdit}
                className="rounded-lg p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                placeholder={selectedComponent.editor?.placeholder || 'Share a memory, wish, or note…'}
                maxLength={507}
                className="mb-2 h-36 w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-3 py-2 font-body-md text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <div className="text-right font-body-sm text-[var(--color-on-surface-variant)]">
                {tempMessage.length}/507
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelMessageEdit}
                className="rounded-lg px-4 py-2 font-label-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMessage}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-label-lg text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editPhotoModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface-container-lowest)] p-6 shadow-2xl ring-1 ring-[var(--color-outline-variant)]/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[var(--color-on-surface)]">Photo</h2>
              <button
                type="button"
                onClick={handleCancelPhotoEdit}
                className="rounded-lg p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedComponent.image_url ? (
              <div className="mb-4 overflow-hidden rounded-xl ring-1 ring-[var(--color-outline-variant)]/40">
                <Image
                  src={selectedComponent.image_url}
                  alt="Uploaded photo"
                  width={300}
                  height={200}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : (
              <p className="mb-4 font-body-md text-[var(--color-on-surface-variant)]">No photo yet.</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-lg bg-[var(--color-surface-container-high)] px-4 py-2 font-label-lg text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]">
                {selectedComponent.image_url ? 'Replace photo' : 'Add a photo'}
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
                  type="button"
                  className="rounded-lg px-4 py-2 font-label-lg text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (selectedComponent) {
                      const slotIndex = pages[currentPageIndex].components.indexOf(selectedComponent);
                      handleRemoveImage(currentPageIndex, slotIndex);
                    }
                    setEditPhotoModalOpen(false);
                  }}
                >
                  Remove
                </button>
              )}

              <button
                type="button"
                onClick={handleCancelPhotoEdit}
                className="ml-auto rounded-lg px-4 py-2 font-label-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
              >
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