import { ImageSlot } from "./ImageSlot";
import { MessageSection } from "./MessageSection";
import { Page } from "./SignatureEditModal";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  page: Page;
  pageIndex: number;
  activePage: number;
  uploading: boolean;
  error: string | null;
  setActivePage: (index: number) => void;
  setShowLayoutModal: (value: boolean) => void;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    pageIndex: number,
    slotIndex: number
  ) => void;
  handleRemoveImage: (pageIndex: number, slotIndex: number) => void;
  signature: string;
  editingMessage: boolean;
  setEditingMessage: (value: boolean) => void;
  setIsSignatureModalOpen: (value: boolean) => void;
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  page,
  pageIndex,
  activePage,
  uploading,
  error,
  setActivePage,
  setShowLayoutModal,
  handleFileUpload,
  handleRemoveImage,
  signature,
  editingMessage,
  setEditingMessage,
  setIsSignatureModalOpen,
  setPages,
}) => {
  const getSelectedLayoutComponent = () => {
    const layoutId = page.layout;
    const categoryIndex = Math.floor(layoutId / 10);
    const layoutIndex = layoutId % 10;

    const layoutCategories = [
      {
        title: 'Message Only',
        layouts: [
          () => (
            <MessageSection
              signature={signature}
              message={page.message}
              pageIndex={pageIndex}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
              setIsSignatureModalOpen={setIsSignatureModalOpen}
              setPages={setPages}
            />
          ),
          () => (
            <MessageSection
              signature={signature}
              message={page.message}
              pageIndex={pageIndex}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
              setIsSignatureModalOpen={setIsSignatureModalOpen}
              setPages={setPages}
            />
          ),
        ],
      },
      {
        title: 'Photos Only',
        layouts: [
          () => (
            <div className="grid grid-cols-2 gap-4">
              {page.images.slice(0, 2).map((image, i) => (
                <ImageSlot
                  key={i}
                  image={image}
                  index={i}
                  pageIndex={pageIndex}
                  uploading={uploading}
                  handleFileUpload={handleFileUpload}
                  handleRemoveImage={handleRemoveImage}
                />
              ))}
              {error && (
                <div className="text-red-500 text-sm mt-2 col-span-2">
                  {error}
                </div>
              )}
            </div>
          ),
          () => (
            <div className="grid grid-rows-2 gap-2">
              {page.images.slice(0, 2).map((image, i) => (
                <ImageSlot
                  key={i}
                  image={image}
                  index={i}
                  pageIndex={pageIndex}
                  uploading={uploading}
                  handleFileUpload={handleFileUpload}
                  handleRemoveImage={handleRemoveImage}
                />
              ))}
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          ),
          () => (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {page.images.slice(0, 2).map((image, i) => (
                  <ImageSlot
                    key={i}
                    image={image}
                    index={i}
                    pageIndex={pageIndex}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                    handleRemoveImage={handleRemoveImage}
                  />
                ))}
              </div>
              <ImageSlot
                image={page.images[2]}
                index={2}
                pageIndex={pageIndex}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
              />
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          ),
          () => (
            <div className="space-y-2">
              <ImageSlot
                image={page.images[0]}
                index={0}
                pageIndex={pageIndex}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
              />
              <div className="grid grid-cols-2 gap-2">
                {page.images.slice(1, 3).map((image, i) => (
                  <ImageSlot
                    key={i + 1}
                    image={image}
                    index={i + 1}
                    pageIndex={pageIndex}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                    handleRemoveImage={handleRemoveImage}
                  />
                ))}
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          ),
          () => (
            <div className="grid grid-rows-2 gap-2">
              {page.images.slice(0, 4).map((image, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <ImageSlot
                    image={image}
                    index={i}
                    pageIndex={pageIndex}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                    handleRemoveImage={handleRemoveImage}
                  />
                  {page.images[i + 2] && (
                    <ImageSlot
                      image={page.images[i + 2]}
                      index={i + 2}
                      pageIndex={pageIndex}
                      uploading={uploading}
                      handleFileUpload={handleFileUpload}
                      handleRemoveImage={handleRemoveImage}
                    />
                  )}
                </div>
              ))}
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          ),
        ],
      },
      {
        title: 'Message with Photos',
        layouts: [
          () => (
            <>
              <MessageSection
                signature={signature}
                message={page.message}
                pageIndex={pageIndex}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                setPages={setPages}
              />
              <ImageSlot
                image={page.images[0]}
                index={0}
                pageIndex={pageIndex}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
              />
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </>
          ),
          () => (
            <>
              <ImageSlot
                image={page.images[0]}
                index={0}
                pageIndex={pageIndex}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
              />
              <MessageSection
                signature={signature}
                message={page.message}
                pageIndex={pageIndex}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                setPages={setPages}
              />
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </>
          ),
          () => (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {page.images.slice(0, 2).map((image, i) => (
                  <ImageSlot
                    key={i}
                    image={image}
                    index={i}
                    pageIndex={pageIndex}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                    handleRemoveImage={handleRemoveImage}
                  />
                ))}
              </div>
              <MessageSection
                signature={signature}
                message={page.message}
                pageIndex={pageIndex}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                setPages={setPages}
              />
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </>
          ),
          () => (
            <>
              <MessageSection
                signature={signature}
                message={page.message}
                pageIndex={pageIndex}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                setPages={setPages}
              />
              <div className="grid grid-cols-2 gap-2">
                {page.images.slice(0, 2).map((image, i) => (
                  <ImageSlot
                    key={i}
                    image={image}
                    index={i}
                    pageIndex={pageIndex}
                    uploading={uploading}
                    handleFileUpload={handleFileUpload}
                    handleRemoveImage={handleRemoveImage}
                  />
                ))}
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </>
          ),
          () => (
            <div className="grid grid-cols-2 gap-4">
              <MessageSection
                signature={signature}
                message={page.message}
                pageIndex={pageIndex}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                setIsSignatureModalOpen={setIsSignatureModalOpen}
                setPages={setPages}
              />
              <ImageSlot
                image={page.images[0]}
                index={0}
                pageIndex={pageIndex}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                handleRemoveImage={handleRemoveImage}
              />
              {error && (
                <div className="text-red-500 text-sm mt-2 col-span-2">
                  {error}
                </div>
              )}
            </div>
          ),
        ],
      },
    ];

    if (categoryIndex >= 0 && categoryIndex < layoutCategories.length) {
      const category = layoutCategories[categoryIndex];
      if (layoutIndex >= 0 && layoutIndex < category.layouts.length) {
        return category.layouts[layoutIndex];
      }
    }
    return layoutCategories[0].layouts[0];
  };

  const LayoutComponent = getSelectedLayoutComponent();

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-2xl min-h-[500px] rounded-2xl border-2 bg-[var(--color-surface-container-lowest)] px-8 py-8 shadow-[0_12px_40px_rgba(17,28,45,0.06)] transition-shadow',
        activePage === pageIndex
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15'
          : 'border-[var(--color-outline-variant)]/40'
      )}
      onClick={() => setActivePage(pageIndex)}
    >
      <LayoutComponent />
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowLayoutModal(true);
          }}
          className="font-label-lg text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]"
        >
          View other layouts
        </button>
      </div>
    </div>
  );
};