"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import GameGrid from "@/components/GameGrid";

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const eventDate = new Date("2025-03-17T00:00:00"); // Example date
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="gradient-line" />
      <div className="gradient-line" />
      <div className="gradient-line" />
      <div className="gradient-line" />
      <div className="gradient-line" />
      <div className="glow" />

      <div className="h-screen flex flex-col items-center justify-center relative">
        <div className="text-center space-y-12 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-300 bg-clip-text text-transparent">
            TEDx Event Reveal
          </h1>
          <div className="grid grid-cols-4 gap-6 max-w-3xl mx-auto px-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <Card key={unit} className="bg-black/40 p-6 backdrop-blur-sm border border-white/10 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-4xl md:text-6xl font-bold text-white">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm uppercase tracking-wider text-white/60">
                    {unit}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-8 animate-bounce z-10">
          <ChevronDown className="w-8 h-8 text-red-400" />
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-3xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Unlock the Mystery
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto">
              Find the hidden numbers to reveal more about the event.
              Choose wisely, you have 3 attempts per day.
            </p>
          </div>
          <GameGrid />
        </div>
      </div>
    </div>
  );
}