'use client'
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChatSupportButton from "@/components/ChatSupportButton";
import { Stepper } from "@/components/Stepper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { HTTP_BACKEND } from "@/utils/config";

export default function YourInformationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contributionId = searchParams ? searchParams.get('contributionId') : null;
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        relationship: "",
        excludeOnline: false,
        notifyMe: false,
    });
    const pathname = usePathname();
    const projectId = useMemo(() => {
        const parts = pathname?.split('/');
        const idIndex = (parts?.indexOf('contribution') ?? -1) + 1;
        return parts?.[idIndex] ?? null;
    }, [pathname]);

    const [showDialog, setShowDialog] = useState(false);

    const handleChange = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!form.firstName.trim()) {
            toast.error("First name is required.");
            return false;
        }
        if (!form.lastName.trim()) {
            toast.error("Last name is required.");
            return false;
        }
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
            toast.error("A valid email is required.");
            return false;
        }
        if (!form.relationship) {
            toast.error("Please select your relationship.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const response = await axios.post(`${HTTP_BACKEND}/api/submit-information`, {
                ...form,
                projectId,
            });
            if (response.status !== 200) {
                toast.error("Failed to submit information.");
                return;
            }
            toast.success("Information submitted successfully!");
            const fillYourDetailsId = response.data.user.id;
            const updateResponse = await axios.patch(`${HTTP_BACKEND}/api/update-contribution/${contributionId}`, {
                fillYourDetailsId,
            });

            if (updateResponse.status !== 200) {
                throw new Error(updateResponse.data.error || 'Failed to update contribution');
            }

            setShowDialog(true);
        } catch (e) {
            toast.error(`Something went wrong while submitting. ${e instanceof Error ? e.message : "Please try again later."}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-white">
            <div className="bg-gradient-to-r from-[#C879FF] to-[#A44EFF] h-2 rounded-t-md mb-6"></div>

            <Stepper />
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

            <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open);
                if (!open) {
                    router.push(`/thank-you/${projectId}`);
                }
            }}>
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
