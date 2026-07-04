import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const LOGO_URL = "https://i.postimg.cc/63Ld4Hhg/Chat-GPT-Image-3-ywlyw-2026-06-19-54-m.png";

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setProgress((p) => Math.min(100, p + 4)), 70);
    const done = window.setTimeout(onComplete, 2200);
    return () => { window.clearInterval(timer); window.clearTimeout(done); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07030E] text-white overflow-hidden select-none">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#8A2BE2]/30 blur-3xl" />
      <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-[#D946EF]/18 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-48 h-48 rounded-full border-2 border-[#D8B8EC]/25 bg-black/30 p-1 shadow-knoux-glow-lg overflow-hidden flex items-center justify-center">
          <img src={LOGO_URL} alt="Knoux AI Clipboard Pro emblem" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mt-8">Knoux <span className="text-[#D8B8EC]">AI Clipboard Pro</span></h1>
        <p className="text-sm font-bold text-[#BFA7DB] tracking-wider mt-2 uppercase">Your clipboard. Upgraded by AI.</p>
        <div className="w-72 mt-10 space-y-3">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#8A2BE2] via-[#B026FF] to-[#D946EF] rounded-full" style={{ width: `${progress}%` }} /></div>
          <div className="text-xs text-[#D8B8EC] font-mono">Loading KNOUX Core... {Math.round(progress)}%</div>
        </div>
      </div>
      <div className="absolute bottom-8 text-[11px] text-[#BFA7DB] font-mono text-center"><div>A Knoux Product</div><div>Crafted by Eng. Sadek Elgazar (Knoux)</div></div>
    </div>
  );
}
