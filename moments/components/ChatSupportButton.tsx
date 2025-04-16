import { Button } from "./ui/button";

export default function ChatSupportButton({ title }: {
    title: string
}) {
    return (
        <div>
            <Button variant="outline" className="text-sm border-primary text-primary hover:bg-primary/10">
                {title}
            </Button>
        </div>
    );
}