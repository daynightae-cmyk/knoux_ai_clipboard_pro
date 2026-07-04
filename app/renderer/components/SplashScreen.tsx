import { useEffect } from "react";
import { KNOUX_BRAND } from "../constants/brand";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const done = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(done);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#fbf7ff] text-knoux-dark-text select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,184,236,.72),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(138,43,226,.14),transparent_26%),linear-gradient(135deg,#fff_0%,#f7f0ff_48%,#fff_100%)]" />
      <div className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#D8B8EC]/55 blur-3xl knoux-float" />
      <div className="absolute top-16 -right-20 h-80 w-80 rounded-full bg-[#8A2BE2]/18 blur-3xl knoux-float [animation-delay:1.4s]" />
      <div className="absolute bottom-10 left-1/3 h-52 w-52 rounded-full bg-white/70 blur-2xl knoux-float [animation-delay:2.2s]" />
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(90deg,rgba(111,45,189,.18)_1px,transparent_1px),linear-gradient(0deg,rgba(111,45,189,.14)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(138,43,226,.28)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#8A2BE2]/20 blur-3xl" />
          <div className="absolute inset-5 rounded-full knoux-orbit-ring" />
          <div className="absolute inset-10 rounded-full knoux-orbit-ring knoux-orbit-ring-slow" />
          <div className="absolute inset-16 rounded-full border border-white/80 shadow-[inset_0_0_30px_rgba(138,43,226,.16)]" />
          <div className="relative h-40 w-40 overflow-hidden rounded-full border border-white/80 bg-white/75 p-1 shadow-[0_24px_90px_rgba(138,43,226,.28)] backdrop-blur-xl knoux-logo-pulse">
            <img src={KNOUX_BRAND.logoUrl} alt={`${KNOUX_BRAND.productName} official emblem`} referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
          </div>
        </div>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#241B39]">
          {KNOUX_BRAND.productName}
        </h1>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.26em] text-[#6F2DBD]">
          {KNOUX_BRAND.tagline}
        </p>
        <div className="mt-8 rounded-full border border-white/70 bg-white/55 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#6F2DBD] shadow-[0_18px_50px_rgba(138,43,226,.12)] backdrop-blur-xl">
          Initializing KNOUX Core...
        </div>
      </div>

      <div className="absolute bottom-8 z-10 text-center font-mono text-[11px] text-[#6F2DBD]/75">
        <div>{KNOUX_BRAND.productMark}</div>
        <div>Crafted by {KNOUX_BRAND.developer}</div>
      </div>
    </div>
  );
}
