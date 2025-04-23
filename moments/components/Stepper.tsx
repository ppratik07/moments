export const Stepper = () => {
    return (
        <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
                    <span className="font-semibold text-black">Contribute</span>
                </span>
                <span>{">"}</span>
                <span className="flex items-center space-x-1">
                    <div className="w-4 h-4 border border-[#7C3AED] rounded-full" />
                    <span className="text-black font-semibold">Your Information</span>
                </span>
                <span>{">"}</span>
                <div className="w-4 h-4 border border-[#7C3AED] rounded-full" />
                <span className="text-black">Done</span>
            </div>
        </div>
    );
}