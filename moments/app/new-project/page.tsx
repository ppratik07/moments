'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeliveryDate } from '@/hooks/useDeliveryDate';
import { HeadsUpModal } from '@/components/ModalPopup';
import Link from 'next/link';
import ChatSupportButton from '@/components/ChatSupportButton';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/useProjectStore';


export default function StartProjectForm() {
    const [date, setDate] = useState<string | null>(null);
    const { isSignedIn } = useCurrentUser();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const { calculatedDate, showHeadsUp } = useDeliveryDate(date);
    const [project, setProject] = useState<string | null>(null);
    const [bookName, setBookName] = useState<string | null>(null);
    const {setProjectName} = useProjectStore();
    useEffect(() => {
        if (showHeadsUp) {
            setShowModal(true);
        }
    }, [showHeadsUp]);
    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!project) return;
        setProjectName(project); // Store in Zustand
        router.push(`/new-project/upload-image`);
    }
    return (
        <div className="min-h-screen bg-white">
            <Header isSignedIn={isSignedIn ?? false} />
            <main className="max-w-4xl mx-auto px-4 py-10">
                <div className="overflow-hidden mb-8">
                    <Image
                        src="https://images.unsplash.com/photo-1662441899435-8bdee58218cd?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Family with sparklers"
                        className="w-full h-96 object-cover"
                        width={500}
                        height={50}
                    />
                </div>
                <h2 className="text-5xl font-bold mb-2">Get Started!</h2>
                <p className="text-muted-foreground mb-10">
                    We will walk you step-by-step through the simple process of setting up your memory book project.
                </p>

                <div className="grid md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Project Information</h3>

                        <Label htmlFor="projectName">Project Name</Label>
                        <Input type='text'
                            id="projectName"
                            placeholder="Example: Uncle John's 50th Birthday"
                            value={project ?? ''}
                            onChange={(e) => setProject(e.target.value)}
                            className="mb-4 mt-2" />

                        <Label htmlFor="recipient">Who is this book for?</Label>
                        <Input id="recipient" type='text'
                        value={bookName??''}
                        onChange={(e)=> setBookName(e.target.value)}
                         placeholder="(person, couple, or group of people)" className="mb-4 mt-2" />

                        <Label htmlFor="dueDate">When do you need the book?</Label>
                        <div className="relative mb-4">
                            <Input
                                type="date"
                                id="dueDate"
                                value={date ?? ''}
                                onChange={(e) => setDate(e.target.value)}
                                className="pr-10 mt-2"
                            />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 pointer-events-none" />
                        </div>

                        <Label htmlFor="eventType">Event Type</Label>
                        <Select>
                            <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Birthday" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="birthday">Birthday</SelectItem>
                                <SelectItem value="anniversary">Anniversary</SelectItem>
                                <SelectItem value="graduation">Graduation</SelectItem>
                                <SelectItem value="memorial">Memorial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!isSignedIn && (<div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Your Information</h3>

                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Aunt Betty" className="mb-4 mt-2" />

                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Aunt Betty" className="mb-4 mt-2" />

                        <Label htmlFor="email">Your Email</Label>
                        <Input id="email" placeholder="auntbetty@gmail.com" className="mb-4 mt-2" />
                    </div>)}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mt-12 gap-4">
                    <ChatSupportButton title='Chat with Support' />
                    <Link href='/new-project/upload-image'>
                        <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 cursor-pointer">
                            Create Project
                        </Button>
                    </Link>
                </div>
            </main>
            <HeadsUpModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                enteredDate={date ?? ''}
                calculatedDate={calculatedDate}
            />
        </div>
    );
}
