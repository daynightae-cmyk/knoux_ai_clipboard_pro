import React, { useState, useEffect } from 'react';
import { ClipboardCopy, Zap, Shield, Cpu, CheckCircle } from 'lucide-react';

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

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps: LoadingStep[] = [
    {
      id: 'init',
      label: 'Initializing Knoux...',
      labelAr: 'تهيئة نوكس...',
      icon: ClipboardCopy,
      duration: 800
    },
    {
      id: 'services',
      label: 'Loading Services...',
      labelAr: 'تحميل الخدمات...',
      icon: Zap,
      duration: 600
    },
    {
      id: 'security',
      label: 'Securing Data...',
      labelAr: 'تأمين البيانات...',
      icon: Shield,
      duration: 500
    },
    {
      id: 'ai',
      label: 'Activating AI...',
      labelAr: 'تفعيل الذكاء الاصطناعي...',
      icon: Cpu,
      duration: 700
    },
    {
      id: 'complete',
      label: 'Ready!',
      labelAr: 'جاهز!',
      icon: CheckCircle,
      duration: 400
    }
  ];

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startStep = (stepIndex: number) => {
      if (stepIndex >= loadingSteps.length) {
        setIsComplete(true);
        setTimeout(onComplete, 500);
        return;
      }

      const step = loadingSteps[stepIndex];
      setCurrentStep(stepIndex);
      
      // Animate progress for this step
      let stepProgress = 0;
      const stepIncrement = 100 / (step.duration / 16); // 60fps
      
      progressInterval = setInterval(() => {
        stepProgress += stepIncrement;
        const totalProgress = (stepIndex * 100 + Math.min(stepProgress, 100)) / loadingSteps.length;
        setProgress(totalProgress);
        
        if (stepProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 16);

      // Move to next step
      stepTimeout = setTimeout(() => {
        startStep(stepIndex + 1);
      }, step.duration);
    };

    startStep(0);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
    };
  }, [onComplete]);

  const currentStepData = loadingSteps[currentStep];
  const Icon = currentStepData?.icon || ClipboardCopy;
  const isArabic = document.documentElement.lang === 'ar';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl transform transition-all duration-500 ${
            isComplete ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
          }`}>
            <Icon className={`w-12 h-12 text-white transition-all duration-300 ${
              isComplete ? 'scale-110' : 'scale-100'
            }`} />
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 animate-ping opacity-20"></div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {isArabic ? 'نوكس' : 'Knoux'}
        </h1>
        <p className="text-lg text-gray-300 mb-8 font-medium">
          {isArabic ? 'مساعد الحافظة الذكي' : 'Intelligent Clipboard Assistant'}
        </p>

        {/* Loading Step */}
        <div className="mb-8">
          <div className={`flex items-center justify-center gap-3 mb-4 transition-all duration-300 ${
            isArabic ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <span className="text-white font-medium">
              {isArabic ? currentStepData?.labelAr : currentStepData?.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="mt-2 text-sm text-gray-400">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {isArabic ? 'ذكاء اصطناعي' : 'AI Powered'}
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            {isArabic ? 'آمن ومشفر' : 'Secure & Encrypted'}
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            {isArabic ? 'سريع وذكي' : 'Fast & Smart'}
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            {isArabic ? 'سهل الاستخدام' : 'Easy to Use'}
          </div>
        </div>

        {/* Version */}
        <div className="mt-8 text-xs text-gray-500">
          {isArabic ? 'الإصدار' : 'Version'} 1.0.0
        </div>
      </div>

      {/* Completion Animation */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse"></div>
      )}

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;