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

const STEPS = [
  { label: "Initializing secure local vault...", icon: ShieldCheck },
  { label: "Starting smart clipboard observer...", icon: Zap },
  { label: "Injecting global command interface...", icon: Cpu },
  { label: "Deploying server-side Knoux AI cores...", icon: Cpu },
  { label: "System secure. Welcome Sadek.", icon: ShieldCheck },
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const totalDuration = 2200; // ms
    const intervalTime = 40;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 450); // wait for exit animation
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * STEPS.length),
      STEPS.length - 1
    );
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-tr from-[#FCFAFF] via-[#F7F2FF] to-[#FCFAFF] p-8 select-none"
        >
          {/* Top aesthetic accent line */}
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-knoux-purple/40 to-transparent mt-4" />

          {/* Main Core Center Area */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-lg text-center">
            {/* Pulsing visual glow ring around logo */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-knoux-purple to-knoux-neon blur-xl"
              />
              <motion.div
                animate={{ scale: [1.1, 1.35, 1.1], opacity: [0.1, 0, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute inset-0 -m-16 rounded-full bg-knoux-magenta-glow/20 blur-2xl"
              />

              {/* Central Approved Circular Medallion Logo */}
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-44 h-44 rounded-full border-2 border-knoux-purple/20 bg-white/90 p-1 shadow-knoux-glow-lg overflow-hidden flex items-center justify-center"
              >
                <img
                  id="splash-logo-img"
                  src="https://i.postimg.cc/63Ld4Hhg/Chat-GPT-Image-3-ywlyw-2026-06-19-54-m.png"
                  alt="Knoux AI Clipboard Pro Master Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </motion.div>
            </div>

            {/* Typography brand layout exactly matching Approved Logo guidelines */}
            <motion.h1
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-knoux-dark-text mt-4"
            >
              Knoux <span className="text-knoux-purple font-extrabold">AI Clipboard Pro</span>
            </motion.h1>

            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-sm font-medium text-knoux-muted-text/80 tracking-wider mt-2 uppercase"
            >
              Your clipboard. Upgraded by AI.
            </motion.p>

            {/* Loading step and Progress Indicators */}
            <div className="w-64 mt-12 space-y-4">
              {/* Progress Bar */}
              <div className="h-[4px] w-full bg-knoux-purple/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-knoux-purple via-knoux-neon to-knoux-magenta-glow rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Active Step Label with dynamic Icon */}
              <div className="flex items-center justify-center gap-2 h-6 text-xs text-knoux-dark-text font-medium">
                <CurrentIcon className="w-3.5 h-3.5 text-knoux-purple animate-pulse" />
                <span className="transition-all duration-300">
                  {STEPS[currentStep].label}
                </span>
                <span className="font-mono text-knoux-purple text-[10px]">
                  ({Math.round(progress)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Footer Credits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center text-[11px] text-knoux-muted-text/70 mt-auto font-mono tracking-wide"
          >
            <span>A Knoux Product</span>
            <span className="text-[10px] mt-0.5 opacity-80">
              Developed by Eng. Sadek Elgazar (Knoux)
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
