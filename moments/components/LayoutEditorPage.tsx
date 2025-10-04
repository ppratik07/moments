'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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
  handleFileDrop?: (file: File, pageIndex: number, slotIndex: number) => void;
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
  handleFileDrop,
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
          onDragOver={(e) => {
            if (!comp.image_url && handleFileDrop) {
              e.preventDefault();
              e.currentTarget.classList.add('border-blue-500');
            }
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-500');
          }}
          onDrop={(e) => {
            if (comp.image_url || !handleFileDrop) return;
            e.preventDefault();
            e.currentTarget.classList.remove('border-blue-500');
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              handleFileDrop(file, currentPageIndex, index);
            }
          }}
        >
          {!comp.image_url && uploading && <span className="text-gray-500 text-sm">Uploading...</span>}
          {!comp.image_url && !uploading && (
            <>
              <span className="text-gray-500 text-sm mb-2">Add a Photo</span>
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
          {comp.value || (
            <span className="text-gray-500 text-sm">Add Text</span>
          )}
        </div>
      );
    }
  };

  const renderThumbnail = (page: Page, pageIndex: number) => {
    return (
      <div className="relative w-[150px] h-[120px] bg-gray-100 border border-gray-300 rounded">
        {page.components.map((comp, compIndex) => (
          <div
            key={`${pageIndex}-${compIndex}`}
            className="absolute border border-gray-400 rounded flex items-center justify-center"
            style={{
              left: ((comp.position?.x_coordinate ?? comp.position?.x_position) || 0) / 5,
              top: ((comp.position?.y_coordinate ?? comp.position?.y_position) || 0) / 5,
              width: comp.size.width / 5,
              height: comp.size.height / 5,
              backgroundColor: comp.type === 'photo' ? '#a3bffa' : '#e0e0e0',
              backgroundImage: comp.type === 'photo' && comp.image_url ? `url(${comp.image_url})` : 'none',
              backgroundSize: 'cover',
              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            {comp.type === 'photo' && !comp.image_url && (
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

  return (
    <div className="flex flex-row gap-4 mx-auto max-w-[1000px]">
      <div className="flex-1">
        <div className="relative w-[800px] h-[700px] border border-gray-300 bg-gray-100 rounded-lg">
          {pages[currentPageIndex]?.components.map((comp, index) => renderComponent(comp, index))}
          {pages.length > 1 && (
            <button
              onClick={() => handleDeletePage(currentPageIndex)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-700"
            >
              🗑️
            </button>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleViewLayouts} className="text-purple-600 hover:underline text-sm">
            View other layouts
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pages" isCombineEnabled={false} isDropDisabled={false}>
          {(provided) => (
            <div
              className="w-[160px] max-h-[700px] overflow-y-auto"
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
                      className={`cursor-pointer border-2 ${index === currentPageIndex ? 'border-purple-600' : 'border-transparent'} mb-2 rounded`}
                      onClick={() => setCurrentPageIndex(index)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full h-auto max-h-[80vh] overflow-y-auto flex flex-col items-center">
            <div className="flex justify-between items-center mb-4 w-full">
              <h2 className="text-lg font-semibold text-gray-800">Pick a Layout</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Click a layout below to use it!</p>
            <div className="grid grid-cols-3 gap-4 justify-items-center w-full">
              {availableLayouts.map((layout) => {
                const previewComponents = isAddingNewPage
                  ? layout.components
                  : mapDataToNewLayout(layout, pages[currentPageIndex].components);
                return (
                  <div
                    key={layout.guid}
                    className="cursor-pointer border border-gray-300 p-4 rounded hover:border-purple-600 w-[250px] h-full"
                    onClick={() => selectLayout(layout)}
                  >
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">{layout.name}</h3>
                    <div className="relative w-full h-45 bg-gray-100 rounded">
                      {previewComponents.map((comp, index) => (
                        <div
                          key={index}
                          className="absolute border border-gray-400 rounded flex items-center justify-center"
                          style={{
                            left: ((comp.position?.x_coordinate ?? comp.position?.x_position) || 0) / 4,
                            top: ((comp.position?.y_coordinate ?? comp.position?.y_position) || 0) / 4,
                            width: comp.size.width / 4,
                            height: comp.size.height / 4,
                            backgroundColor: comp.type === 'photo' ? '#a3bffa' : '#e0e0e0',
                            backgroundImage: comp.type === 'photo' && comp.image_url ? `url(${comp.image_url})` : 'none',
                            backgroundSize: 'cover',
                            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {comp.type === 'photo' && !comp.image_url && (
                            <div className="text-white text-lg">+</div>
                          )}
                          {comp.type !== 'photo' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text;gray-500 text-xs">Text</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-4 w-full">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {editMessageModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Message</h2>
              <button onClick={handleCancelMessageEdit} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="relative">
              <textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                placeholder={selectedComponent.editor?.placeholder || 'Enter your message'}
                maxLength={507}
                className="w-full p-2 border border-gray-300 rounded text-sm mb-2 h-32 resize-none"
              />
              <div className="text-right text-gray-500 text-xs">
                {tempMessage.length}/507
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelMessageEdit}
                className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMessage}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editPhotoModalOpen && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Edit Photo</h2>
              <button onClick={handleCancelPhotoEdit} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
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

            <div className="flex justify-between items-center mt-4 gap-2">
              <label className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-300">
                {selectedComponent.image_url ? 'Replace Photo' : 'Add a Photo'}
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

              <button
                onClick={handleCancelPhotoEdit}
                className="ml-auto px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
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