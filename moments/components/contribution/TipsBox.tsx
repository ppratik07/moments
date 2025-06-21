// components/TipsBox.tsx
import { Button } from "@/components/ui/button";
// import ChatSupportButton from "../ChatSupportButton";

type TipsBoxProps = {
    onNextClick?: () => void; // Make onNextClick optional
};

export default function TipsBox({ onNextClick }: TipsBoxProps) {
    return (
        <div className="flex justify-between items-center mt-6 w-full flex-wrap gap-4">
            {/* <ChatSupportButton title="Chat with Support" /> */}

            <div className="border rounded-md px-4 py-3 text-sm text-gray-700 bg-white shadow-sm">
                <p><strong>Tips:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                    <li>
                        Want to write a longer message? <span className="text-gray-500">Simply choose a different layout.</span>
                    </li>
                    <li>
                        Want to add more photos? <span className="text-gray-500">Add another page</span>
                    </li>
                </ol>
            </div>

            {onNextClick && (
                <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6"
                    onClick={onNextClick}
                >
                    Next
                </Button>
            )}
        </div>
    );
}