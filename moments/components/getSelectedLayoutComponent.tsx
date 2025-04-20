// components/layouts/LayoutCategories.tsx
import Image from 'next/image';
import { LayoutProps, MessageEditorProps } from '@/types/layout.types'; // We'll define types separately

// MessageEditor Component (moved here to avoid duplication)
const MessageEditor = ({ message, setMessage, setEditingMessage }: MessageEditorProps) => (
  <div className="w-full">
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Add your message here..."
      className="w-full p-3 border border-gray-300 rounded-md min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-300"
    />
    <div className="flex justify-end mt-2 space-x-2">
      <button
        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        onClick={() => setEditingMessage(false)}
      >
        Cancel
      </button>
      <button
        className="px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
        onClick={() => setEditingMessage(false)}
      >
        Save
      </button>
    </div>
  </div>
);

// Layout Categories Definition
export const layoutCategories = [
  {
    title: 'Message Only',
    layouts: [
      // Text only layout
      ({
        signature,
        setIsModalOpen,
        message,
        editingMessage,
        setEditingMessage,
        setMessage,
      }: LayoutProps) => (
        <>
          <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p>{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-1">⊕</div>
                  ADD TEXT
                </div>
              )}
            </div>
          )}
        </>
      ),
      // Another message layout variation (italic text)
      ({
        signature,
        setIsModalOpen,
        message,
        editingMessage,
        setEditingMessage,
        setMessage,
      }: LayoutProps) => (
        <>
          <div className="text-lg italic font-medium text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="bg-gray-50 border-l-4 border-purple-400 pl-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p className="italic">{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  <div className="text-lg mb-1 inline-block">⊕</div> ADD TEXT
                </div>
              )}
            </div>
          )}
        </>
      ),
    ],
  },
  {
    title: 'Photos Only',
    layouts: [
      // Two photos side by side
      ({ uploadedImageUrl, setShowUploader }: { uploadedImageUrl: string | null; setShowUploader: (show: boolean) => void }) => (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
              onClick={() => setShowUploader(true)}
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrl ? (
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                    width={500}
                    height={300}
                  />
                ) : (
                  <>
                    <div className="text-lg mb-1">⊕</div>
                    ADD A PHOTO
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
      // One photo on top of another
      ({ uploadedImageUrl, setShowUploader }: { uploadedImageUrl: string | null; setShowUploader: (show: boolean) => void }) => (
        <div className="grid grid-rows-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
              onClick={() => setShowUploader(true)}
            >
              <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
              <div className="relative z-10 text-center">
                {uploadedImageUrl ? (
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                    width={500}
                    height={300}
                  />
                ) : (
                  <>
                    <div className="text-lg mb-1">⊕</div>
                    ADD A PHOTO
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
      // Three photo layout (2 top, 1 bottom)
      ({ uploadedImageUrl, setShowUploader }: { uploadedImageUrl: string | null; setShowUploader: (show: boolean) => void }) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                onClick={() => setShowUploader(true)}
              >
                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                <div className="relative z-10 text-center">
                  {uploadedImageUrl ? (
                    <Image
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                  ) : (
                    <>
                      <div className="text-lg mb-1">⊕</div>
                      ADD A PHOTO
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div
            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            onClick={() => setShowUploader(true)}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
            <div className="relative z-10 text-center">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <>
                  <div className="text-lg mb-1">⊕</div>
                  ADD A PHOTO
                </>
              )}
            </div>
          </div>
        </div>
      ),
      // Three photo layout (1 top, 2 bottom)
      ({ uploadedImageUrl, setShowUploader }: { uploadedImageUrl: string | null; setShowUploader: (show: boolean) => void }) => (
        <div className="space-y-2">
          <div
            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            onClick={() => setShowUploader(true)}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
            <div className="relative z-10 text-center">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <>
                  <div className="text-lg mb-1">⊕</div>
                  ADD A PHOTO
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                onClick={() => setShowUploader(true)}
              >
                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                <div className="relative z-10 text-center">
                  {uploadedImageUrl ? (
                    <Image
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-full object tars-cover"
                      width={500}
                      height={300}
                    />
                  ) : (
                    <>
                      <div className="text-lg mb-1">⊕</div>
                      ADD A PHOTO
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      // Four photo layout (2x2 grid)
      ({ uploadedImageUrl, setShowUploader }: { uploadedImageUrl: string | null; setShowUploader: (show: boolean) => void }) => (
        <div className="grid grid-rows-2 gap-2">
          {[...Array(2)].map((_, row) => (
            <div key={row} className="grid grid-cols-2 gap-2">
              {[...Array(2)].map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                  onClick={() => setShowUploader(true)}
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                  <div className="relative z-10 text-center">
                    {uploadedImageUrl ? (
                      <Image
                        src={uploadedImageUrl}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                        width={500}
                        height={300}
                      />
                    ) : (
                      <>
                        <div className="text-lg mb-1">⊕</div>
                        ADD A PHOTO
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    ],
  },
  {
    title: 'Message with Photos',
    layouts: [
      // Message on top, photo below
      ({
        signature,
        setIsModalOpen,
        message,
        editingMessage,
        setEditingMessage,
        setMessage,
        uploadedImageUrl,
        setShowUploader,
      }: LayoutProps) => (
        <>
          <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p>{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-1">⊕</div>
                  ADD TEXT
                </div>
              )}
            </div>
          )}
          <div
            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            onClick={() => setShowUploader(true)}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
            <div className="relative z-10 text-center">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <>
                  <div className="text-lg mb-1">⊕</div>
                  ADD A PHOTO
                </>
              )}
            </div>
          </div>
        </>
      ),
      // Photo on top, message below
      ({ signature, setIsModalOpen, message, editingMessage, setEditingMessage, setMessage, uploadedImageUrl, setShowUploader }: LayoutProps) => (
        <>
          <div
            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer mb-4"
            onClick={() => setShowUploader(true)}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
            <div className="relative z-10 text-center">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <>
                  <div className="text-lg mb-1">⊕</div>
                  ADD A PHOTO
                </>
              )}
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p>{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-1">⊕</div>
                  ADD TEXT
                </div>
              )}
            </div>
          )}
        </>
      ),
      // Two photos on top, message below
      ({ signature, setIsModalOpen, message, editingMessage, setEditingMessage, setMessage, uploadedImageUrl, setShowUploader }: LayoutProps) => (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                onClick={() => setShowUploader(true)}
              >
                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                <div className="relative z-10 text-center">
                  {uploadedImageUrl ? (
                    <Image
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                  ) : (
                    <>
                      <div className="text-lg mb-1">⊕</div>
                      ADD A PHOTO
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p>{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-1">⊕</div>
                  ADD TEXT
                </div>
              )}
            </div>
          )}
        </>
      ),
      // Message on top, two photos below
      ({ signature, setIsModalOpen, message, editingMessage, setEditingMessage, setMessage, uploadedImageUrl, setShowUploader }: LayoutProps) => (
        <>
          <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {signature}
            <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
              ✎
            </button>
          </div>
          {editingMessage ? (
            <MessageEditor
              message={message}
              setMessage={setMessage}
              setEditingMessage={setEditingMessage}
            />
          ) : (
            <div
              className="mb-4 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setEditingMessage(true)}
            >
              {message ? (
                <div className="text-gray-800">
                  <p>{message}</p>
                  <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-1">⊕</div>
                  ADD TEXT
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
                onClick={() => setShowUploader(true)}
              >
                <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
                <div className="relative z-10 text-center">
                  {uploadedImageUrl ? (
                    <Image
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                    />
                  ) : (
                    <>
                      <div className="text-lg mb-1">⊕</div>
                      ADD A PHOTO
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ),
      // Message with photo to the side
      ({ signature, setIsModalOpen, message, editingMessage, setEditingMessage, setMessage, uploadedImageUrl, setShowUploader }: LayoutProps) => (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {signature}
              <button className="text-purple-600 text-sm underline" onClick={() => setIsModalOpen(true)}>
                ✎
              </button>
            </div>
            {editingMessage ? (
              <MessageEditor
                message={message}
                setMessage={setMessage}
                setEditingMessage={setEditingMessage}
              />
            ) : (
              <div
                className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingMessage(true)}
              >
                {message ? (
                  <div className="text-gray-800">
                    <p>{message}</p>
                    <div className="mt-2 text-purple-600 text-sm underline">Edit message</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg mb-1">⊕</div>
                    ADD TEXT
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className="bg-gray-100 relative aspect-[4/3] flex items-center justify-center text-gray-700 font-medium text-sm cursor-pointer"
            onClick={() => setShowUploader(true)}
          >
            <div className="absolute inset-0 opacity-40 bg-[url('/mock-trees-bg.svg')] bg-center bg-contain bg-no-repeat" />
            <div className="relative z-10 text-center">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <>
                  <div className="text-lg mb-1">⊕</div>
                  ADD A PHOTO
                </>
              )}
            </div>
          </div>
        </div>
      ),
    ],
  },
];