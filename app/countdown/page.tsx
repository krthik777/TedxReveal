"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import GameGrid from "@/components/GameGrid";
import { ThreeDots } from "react-loader-spinner";
import ReactTypingEffect from "react-typing-effect";
const countdownVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const timeUnitVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const eventDate = new Date("2025-03-12T07:00:00"); // Example date

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Full-screen TEDx Logo Overlay with subtle receding animation */}
      {showLogo && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={() => setShowLogo(false)}
        >
          <motion.img
            src="https://tedxajce.in/images/logo/logo.png"
            alt="TEDx Logo"
            className="w-48 md:w-64 object-contain mb-4"
          />
          <ThreeDots color="#ec0023" />
        </motion.div>
      )}

      <div className="h-screen flex flex-col items-center justify-center relative px-4">
        <motion.div
          className="text-center space-y-8 md:space-y-12 relative z-10 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
            <motion.h1
            className="text-4xl sm:text-6xl md:text-4xl font-bold text-[#ec0023] px-2 tracking-wide uppercase"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: "'Hexlvetica Neue', sans-serif" }} // Changed font style to match TEDx theme
            >
            <span className="justify-center flex"><img src="https://tedxajce.in/images/logo/logo.png" alt="TEDx" /></span>
            <br />
            Event Countdown
            </motion.h1>

            <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto"
            variants={countdownVariants}
            initial="hidden"
            animate="visible"
            >
              {Object.entries(timeLeft).map(([unit, value]) => (
              <motion.div key={unit} variants={timeUnitVariants} className="w-full">
              <Card className="bg-black/40 p-3 sm:p-4 md:p-6 backdrop-blur-sm border border-white/10 relative overflow-hidden group">
                <motion.div 
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-white/60">
                  {unit}
                </div>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
              </motion.div>
            ))}

            <motion.div
              className="col-span-2 sm:col-span-4 text-center text-white text-lg sm:text-2xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ReactTypingEffect
              text={["Something big is coming!! Stay tuned", "Unlock the mystery to reveal more🪄", "Look for your lucky numbers🍀"]}
              
              speed={100}
              eraseSpeed={50}
              eraseDelay={2000}
              typingDelay={500}
              />
            </motion.div>
            </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-red-400" />
        </motion.div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-xs sm:max-w-2xl md:max-w-3xl space-y-8 md:space-y-12">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#ec0023]">
              Unlock the Mystery
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto px-4">
              Three Days of thrill. One Goal.  See you here after the next 24 hrs. 
              Remember your Choice is the key!!
            </p>
          </motion.div>
          <GameGrid />
        </div>
      </div>
    </div>
  );
}
