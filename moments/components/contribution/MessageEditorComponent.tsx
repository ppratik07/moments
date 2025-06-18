'use client';

import { useEffect, useRef } from "react";

interface MessageEditorProps {
    message: string;
    setMessage: (value: string) => void;
    setEditingMessage: (value: boolean) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
    message,
    setMessage,
    setEditingMessage,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    return (
        <div className="w-full max-w-[90vw] sm:max-w-full mx-auto">
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Add your message here..."
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md min-h-[100px] sm:min-h-[120px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="flex justify-end mt-2 sm:mt-3 space-x-2">
                <button
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => setEditingMessage(false)}
                >
                    Cancel
                </button>
                <button
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    onClick={() => setEditingMessage(false)}
                >
                    Save
                </button>
            </div>
        </div>
    );
};