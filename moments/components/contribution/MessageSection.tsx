import { MessageEditor } from "./MessageEditorComponent";
import { Page } from "./SignatureEditModal";

interface MessageSectionProps {
    signature: string;
    message: string;
    pageIndex: number;
    editingMessage: boolean;
    setEditingMessage: (value: boolean) => void;
    setIsSignatureModalOpen: (value: boolean) => void;
    setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  }
  
  export const MessageSection: React.FC<MessageSectionProps> = ({
    signature,
    message,
    pageIndex,
    editingMessage,
    setEditingMessage,
    setIsSignatureModalOpen,
    setPages,
  }) => (
    <>
      <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {signature}
        <button
          className="text-purple-600 text-sm underline"
          onClick={() => setIsSignatureModalOpen(true)}
        >
          ✎
        </button>
      </div>
      {editingMessage ? (
        <MessageEditor
          message={message}
          setMessage={(newMessage) =>
            setPages((prev) => {
              const newPages = [...prev];
              newPages[pageIndex].message = newMessage;
              return newPages;
            })
          }
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
              <div className="mt-2 text-purple-600 text-sm underline">
                Edit message
              </div>
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
  );