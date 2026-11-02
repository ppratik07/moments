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
      <div className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-[var(--color-on-surface)]">
        {signature}
        <button
          type="button"
          className="rounded-md px-2 py-0.5 font-label-lg text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)]"
          onClick={() => setIsSignatureModalOpen(true)}
          aria-label="Edit signature"
        >
          Edit
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
          className="min-h-[120px] cursor-pointer rounded-xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]/60 p-6 text-center transition-colors hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-surface-container-low)]"
          onClick={() => setEditingMessage(true)}
        >
          {message ? (
            <div className="text-left text-[var(--color-on-surface)]">
              <p className="font-body-md leading-relaxed whitespace-pre-wrap">{message}</p>
              <div className="mt-3 font-label-lg text-[var(--color-primary)]">Edit message</div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-[var(--color-on-surface-variant)]">
              <span className="mb-2 text-2xl leading-none text-[var(--color-primary)]/60">✎</span>
              <span className="font-label-lg">Add text</span>
            </div>
          )}
        </div>
      )}
    </>
  );