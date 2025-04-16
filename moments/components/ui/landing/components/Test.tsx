import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import Image from 'next/image';

export default function ISDNLandingPage() {
    return (
        <div className="bg-white text-black font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#3c2c1e] text-white">
                <div className="flex items-center space-x-4">
                    <Image src="/logo.svg" alt="HostProfis Logo" className="h-8" width={200} height={200} />
                    <span className="text-sm bg-pink-600 px-2 py-1 rounded">Anonymous</span>
                </div>
                <nav className="hidden md:flex space-x-6 text-sm">
                    <a href="#" className="hover:underline">Funktionen</a>
                    <a href="#" className="hover:underline">Preise</a>
                    <a href="#" className="hover:underline">Reviews</a>
                    <a href="#" className="hover:underline">Vergleich</a>
                    <a href="#" className="hover:underline">FAQ</a>
                </nav>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 text-sm">Beratung Vereinbaren</Button>
            </header>

            {/* Hero Section */}
            <main className="grid md:grid-cols-2 gap-8 px-6 py-12 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Sie sind von der ISDN Abschaltung betroffen?</h1>
                    <p className="mb-4 text-lg">Wechseln Sie in nur 14 Tagen zu moderner Cloud-Telefonie – ohne hohe Kosten, ohne Stress und ohne Unterbrechungen.</p>
                    <ul className="space-y-2 text-green-700 font-semibold">
                        <li>✅ Ihre Telefonnummern <span className="font-bold text-black">bleiben erhalten</span></li>
                        <li>✅ Keine <span className="font-bold text-black">teuren Anschaffungskosten</span></li>
                        <li>✅ Betreuung durch unser <span className="font-bold text-black">österreichisches Team</span></li>
                    </ul>

                    <Card className="mt-6 max-w-md">
                        <CardContent className="py-4">
                            <p className="italic text-sm">"Unsere ISDN-Leitung wurde mit nur 6 Wochen Frist gekündigt. Hostprofis hat unser neues System in nur 14 Tagen eingerichtet und wir konnten alle Nummern behalten. Keine Ausfallzeit, kein Stress."</p>
                            <div className="flex items-center mt-4 space-x-2">
                                <Image src="/user-avatar.jpg" alt="Gregor Zeisl" className="h-10 w-10 rounded-full" />
                                <div>
                                    <p className="font-semibold">Gregor Zeisl</p>
                                    <div className="text-yellow-400">★★★★★</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}
                <Card className="bg-gradient-to-b from-yellow-50 to-white border border-yellow-300">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Jetzt 100% kostenlos und unverbindlich beraten lassen!</h2>
                        <form className="space-y-4">
                            <Input placeholder="Max Mustermann" className="w-full" />
                            <Input placeholder="Mustermann GmbH" className="w-full" />
                            <Input type="email" placeholder="max@mustermann.at" className="w-full" />
                            <Input type="tel" placeholder="+43 123456789" className="w-full" />
                            <div className="w-full">
                                <Select>
                                    <SelectContent>
                                        <SelectItem value="1-5">1-5 Mitarbeiter</SelectItem>
                                        <SelectItem value="6-20">6-20 Mitarbeiter</SelectItem>
                                        <SelectItem value="21-50">21-50 Mitarbeiter</SelectItem>
                                        <SelectItem value="51+">51+ Mitarbeiter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">Jetzt kostenlos beraten lassen</Button>
                            <p className="text-xs text-gray-600 text-center">Ihre Daten sind sicher – Keine Werbung!</p>
                        </form>

                        {/* Badges */}
                        <div className="flex justify-center gap-4 mt-6">
                            <Image src="/badge1.png" alt="Top 50" className="h-10" />
                            <Image src="/badge2.png" alt="PC Pro" className="h-10" />
                            <Image src="/badge3.png" alt="Leader" className="h-10" />
                            <Image src="/badge4.png" alt="Capterra" className="h-10" />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
