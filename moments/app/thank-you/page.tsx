"use client";

import { getImageUrl } from "@/helpers/getImageUrl";
import { useProjectStore } from "@/store/useProjectStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function DonePage() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const projectName = useProjectStore.getState().projectName;
  const imagePhoto = useProjectStore.getState().imageKey;

  useEffect(() => {
    setHasMounted(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!hasMounted) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-white">
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="border-b bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white text-lg font-semibold">
        MemoryLane
      </div>

      <div className="flex justify-center">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 pt-10">
          <span className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
            <span className="font-semibold text-black">Contribute</span>
          </span>
          <span>{">"}</span>
          <span className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
            <span className="text-black font-semibold">Your Information</span>
          </span>
          <span>{">"}</span>
          <div className="w-4 h-4 rounded-full bg-[#7C3AED]" />
          <span className="text-black">Done</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-9">Thank You!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for taking a moment to contribute to {projectName} book. It is a special and touching moment when someone receives one of these books. It will lift their spirit and help them know they are loved by so many. Thank you for contributing to this wonderful book.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-gray-50 shadow-sm mt-12">
            <h2 className="text-3xl font-bold text-gray-800">Start Your Own Book</h2>
            <p className="text-gray-600 mt-4">
              We have memory books for every occasion! Start one of your own today.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-white border border-purple-500 text-purple-600 rounded-md hover:bg-purple-50">
                Learn More
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex justify-center items-center">
          <div className="w-full max-h-[400px] overflow-hidden rounded-lg shadow-md">
            <Image
              src={
                getImageUrl(imagePhoto) || ''
              }
              alt="Crowd at concert"
              width={800}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
