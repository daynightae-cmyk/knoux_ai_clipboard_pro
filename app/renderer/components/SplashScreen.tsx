/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, ShieldCheck, Zap } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const LOGO_URL = "https://i.postimg.cc/XJv5b0ZR/cropped-circle-image-(1).png";

const STEPS = [
  { label: "Initializing secure local vault...", icon: ShieldCheck },
  { label: "Starting smart clipboard observer...", icon: Zap },
  { label: "Injecting KNOUX command interface...", icon: Cpu },
  { label: "Preparing AI productivity core...", icon: Cpu },
  { label: "System secure. Welcome to KNOUX.", icon: ShieldCheck },
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const totalDuration = 2200;
    const intervalTime = 40;
    const increment = 100 / (totalDuration / intervalTime);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsExiting(true);
          setTimeout(onComplete, 450);
          return 100;
        }
        return next;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepIndex = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1);
    setCurrentStep(stepIndex);
  }, [progress]);

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#07030E] p-8 select-none overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#8A2BE2]/30 blur-3xl" />
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-[#D946EF]/18 blur-3xl" />
          <div className="relative z-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D8B8EC]/55 to-transparent mt-4" />

          <div className="relative z-10 flex flex-col items-center justify-center flex-1 max-w-lg text-center">
            <div className="relative mb-8 flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.18, 0.05, 0.18] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#D946EF] blur-xl" />
              <motion.div animate={{ scale: [1.1, 1.35, 1.1], opacity: [0.12, 0, 0.12] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute inset-0 -m-16 rounded-full bg-[#D8B8EC]/20 blur-2xl" />
              <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 w-44 h-44 rounded-full border-2 border-[#D8B8EC]/25 bg-black/30 p-1 shadow-knoux-glow-lg overflow-hidden flex items-center justify-center">
                <img id="splash-logo-img" src={LOGO_URL} alt="Official KNOUX AI Clipboard Pro Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
              </motion.div>
            </div>

            <motion.h1 initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-4">
              Knoux <span className="text-[#D8B8EC]">AI Clipboard Pro</span>
            </motion.h1>
            <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }} className="text-sm font-bold text-[#BFA7DB] tracking-wider mt-2 uppercase">
              Your clipboard. Upgraded by AI.
            </motion.p>

            <div className="w-64 mt-12 space-y-4">
              <div className="h-[4px] w-full bg-white/10 rounded-full overflow-hidden relative"><motion.div className="h-full bg-gradient-to-r from-[#8A2BE2] via-[#B026FF] to-[#D946EF] rounded-full" style={{ width: `${progress}%` }} /></div>
              <div className="flex items-center justify-center gap-2 h-6 text-xs text-white font-bold"><CurrentIcon className="w-3.5 h-3.5 text-[#D8B8EC] animate-pulse" /><span>{STEPS[currentStep].label}</span><span className="font-mono text-[#D8B8EC] text-[10px]">({Math.round(progress)}%)</span></div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.86 }} transition={{ delay: 0.5, duration: 0.5 }} className="relative z-10 flex flex-col items-center text-[11px] text-[#BFA7DB] mt-auto font-mono tracking-wide">
            <span>A Knoux Product</span>
            <span className="text-[10px] mt-0.5 opacity-80">Crafted by Eng. Sadek Elgazar (Knoux)</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
