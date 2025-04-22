'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChatSupportButton from "@/components/ChatSupportButton";

export default function YourInformationPage() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        relationship: "",
        excludeOnline: false,
        notifyMe: false,
    });

    const [showDialog, setShowDialog] = useState(false);

    const handleChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowDialog(true);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-white">
            <div className="bg-gradient-to-r from-[#C879FF] to-[#A44EFF] h-2 rounded-t-md mb-6"></div>

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
            <hr className="w-full border-t border-black mb-6" />
            <h1 className="text-3xl font-bold mb-2">Your Information</h1>
            <p className="mb-6 text-sm text-muted-foreground pt-10">
                Add your name and email to be able to save your work and edit it later, and your project organizer can contact you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>First Name</Label>
                        <Input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} className="mt-4" />
                    </div>
                    <div>
                        <Label>Last Name</Label>
                        <Input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} className="mt-4" />
                    </div>
                </div>

                <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-4" />
                </div>

                <div>
                    <Label className="mb-4">Relationship (How do you know?)</Label>
                    <Select onValueChange={(value) => handleChange("relationship", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select relationship" className="mt-4" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Friend">Friend</SelectItem>
                            <SelectItem value="Family">Family</SelectItem>
                            <SelectItem value="Coworker">Coworker</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-start space-x-2 mt-10">
                        <Checkbox id="exclude" checked={form.excludeOnline} onCheckedChange={(value) => handleChange("excludeOnline", value)} />
                        <Label htmlFor="exclude">
                            Exclude from online version of the book. <span className="text-xs text-purple-700 cursor-pointer underline">Learn More</span>
                        </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox id="notify" checked={form.notifyMe} onCheckedChange={(value) => handleChange("notifyMe", !!value)} />
                        <Label htmlFor="notify">
                            Notify me of promotions and upcoming events that might work well for a memory book.
                        </Label>
                    </div>
                </div>

                <div className="pt-8 flex justify-between items-center w-full">
                    <ChatSupportButton title="Chat with Support" />
                    <Button type="submit" className="bg-gradient-to-r from-[#C879FF] to-[#A44EFF] text-white px-6 py-2 rounded-xs cursor-pointer">
                        Finish
                    </Button>
                </div>
            </form>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Online Book Exclusion</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                            When the physical memory book is purchased by your project organizer an online version of the book is made available as well.
                            This online version can be shared with family and friends by the project organizer.
                        </p>
                        <p>
                            If your contribution is more of a sensitive nature you can choose to exclude your contribution from the online version of the
                            book if you don’t want others to read it.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
