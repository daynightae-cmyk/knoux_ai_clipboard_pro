import React, { useState, useEffect } from 'react';
import { ClipboardCopy, Zap, Shield, Cpu, CheckCircle } from 'lucide-react';
import knouxLogo from '../../../assets/icons/icon.png';

interface SplashScreenProps {
  onComplete: () => void;
}

interface LoadingStep {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ComponentType<any>;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'init',
    label: 'Initializing KNOUX core...',
    labelAr: 'تهيئة نواة KNOUX...',
    icon: ClipboardCopy,
    duration: 700
  },
  {
    id: 'services',
    label: 'Loading clipboard intelligence...',
    labelAr: 'تحميل ذكاء الحافظة...',
    icon: Zap,
    duration: 650
  },
  {
    id: 'security',
    label: 'Securing local data...',
    labelAr: 'تأمين البيانات المحلية...',
    icon: Shield,
    duration: 550
  },
  {
    id: 'ai',
    label: 'Activating AI workspace...',
    labelAr: 'تفعيل مساحة الذكاء الاصطناعي...',
    icon: Cpu,
    duration: 650
  },
  {
    id: 'complete',
    label: 'Ready for productivity.',
    labelAr: 'جاهز للإنتاجية.',
    icon: CheckCircle,
    duration: 350
  }
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    let stepTimeout: ReturnType<typeof setTimeout> | undefined;

    const startStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        setIsComplete(true);
        stepTimeout = setTimeout(onComplete, 450);
        return;
      }

      const step = loadingSteps[stepIndex];
      setCurrentStep(stepIndex);
      let stepProgress = 0;
      const stepIncrement = 100 / (step.duration / 16);

      progressInterval = setInterval(() => {
        stepProgress += stepIncrement;
        const totalProgress = (stepIndex * 100 + Math.min(stepProgress, 100)) / loadingSteps.length;
        setProgress(Math.min(totalProgress, 100));

        if (stepProgress >= 100 && progressInterval) {
          clearInterval(progressInterval);
        }
      }, 16);

      stepTimeout = setTimeout(() => startStep(stepIndex + 1), step.duration);
    };

    startStep(0);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  const currentStepData = loadingSteps[currentStep] || loadingSteps[0];
  const Icon = currentStepData.icon;
  const isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#12051f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,43,226,0.38),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(166,120,221,0.24),transparent_32%),linear-gradient(135deg,#090014_0%,#1a0630_45%,#05040a_100%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />

      <div className="relative z-10 w-[min(92vw,520px)] rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-[30px] border border-white/15 bg-gradient-to-br from-[#8A2BE2] via-[#6F2DBD] to-[#262626] shadow-[0_0_48px_rgba(138,43,226,.5)]">
          <img src={knouxLogo} alt="KNOUX" className={`h-20 w-20 rounded-2xl object-contain transition-all duration-500 ${isComplete ? 'scale-110 rotate-6' : 'scale-100'}`} />
          <div className="absolute h-28 w-28 animate-ping rounded-[30px] border border-[#A678DD]/40" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.36em] text-[#D8B8EC]">
          A KNOUX PRODUCT
        </p>
        <h1 className="mb-3 bg-gradient-to-r from-white via-[#D8B8EC] to-[#A678DD] bg-clip-text text-4xl font-black text-transparent">
          Knoux AI Clipboard Pro
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-6 text-white/70">
          {isArabic ? 'مدير حافظة ذكي، آمن، وسريع — مبني للإنتاجية اليومية.' : 'A secure, intelligent clipboard workspace engineered for daily productivity.'}
        </p>

        <div className={`mb-5 flex items-center justify-center gap-3 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8A2BE2]/25 text-[#D8B8EC] ring-1 ring-[#A678DD]/30">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-white/90">
            {isArabic ? currentStepData.labelAr : currentStepData.label}
          </span>
        </div>

        <div className="mx-auto h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#8A2BE2] via-[#A678DD] to-[#D8B8EC] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-3 text-xs text-white/50">{Math.round(progress)}%</div>

        <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-white/70">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">AI Clipboard</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">Local Security</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">Fast Search</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">KNOUX Brand</div>
        </div>

        <div className="mt-7 text-[11px] text-white/40">
          v1.0.0 · knoux.store · Eng. Sadek Elgazar
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
