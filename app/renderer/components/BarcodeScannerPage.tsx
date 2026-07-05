import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Camera, Upload, X, Copy, Save, ScanLine, AlertTriangle, ClipboardPaste } from 'lucide-react';
import { motion } from 'framer-motion';
import i18n from '../utils/i18n';

// Assuming this type is available from a shared types file
interface ClipboardItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  source?: string;
  createdAt: string;
  isSecure?: boolean;
  tags?: string[];
  aiSummarized?: boolean;
  aiTags?: string[];
}

interface BarcodeScannerPageProps {
  onSaveToHub: (item: Partial<ClipboardItem>) => void;
}

export default function BarcodeScannerPage({ onSaveToHub }: BarcodeScannerPageProps) {
  const t = (key: string, fallback: string) => i18n.t(key, fallback);

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());

  const stopScan = useCallback(() => {
    codeReaderRef.current.reset();
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => stopScan();
  }, [stopScan]);

  const handleStartCamera = async () => {
    setError(null);
    setResult(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await codeReaderRef.current.decodeFromStream(stream, videoRef.current, (scanResult, err) => {
          if (scanResult) {
            setResult(scanResult.getText());
            stopScan();
          }
          if (err && !(err instanceof NotFoundException)) {
            setError(t('barcode.error.scanFailed', 'Could not decode barcode.'));
            stopScan();
          }
        });
      }
    } catch (err) {
      setError(t('barcode.error.noCamera', 'Camera not available or permission denied.'));
      setIsScanning(false);
    }
  };

  const handleImageScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      codeReaderRef.current.decodeFromImageUrl(imageUrl)
        .then(scanResult => { setResult(scanResult.getText()); setError(null); })
        .catch(() => { setError(t('barcode.error.scanFailed', 'Could not decode barcode from the image.')); setResult(null); });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePasteScan = () => {
    if (!pastedContent) return;
    codeReaderRef.current.decodeFromImageUrl(pastedContent)
      .then(scanResult => { setResult(scanResult.getText()); setError(null); })
      .catch(() => { setError(t('barcode.error.scanFailed', 'Could not decode barcode from pasted content.')); setResult(null); });
  };

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  const handleSave = () => {
    if (result) {
      onSaveToHub({ content: result, type: 'text', source: 'Barcode Scanner', createdAt: new Date().toISOString() });
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setPastedContent('');
    if (isScanning) stopScan();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto select-none">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{t('barcode.title', 'Barcode & QR Code Scanner')}</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">{t('barcode.description', 'Scan codes using your device camera, an image file, or by pasting content.')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-square lg:aspect-auto lg:h-full bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center">
          {isScanning ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-3/4 h-3/4 overflow-hidden">
                  <div className="absolute inset-0 border-4 border-dashed border-violet-400/50 rounded-2xl" />
                  <motion.div
                    className="absolute w-full h-1 bg-red-500/70 shadow-[0_0_10px_2px_rgba(239,68,68,0.7)]"
                    animate={{ y: ['5%', '95%', '5%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <ScanLine className="w-24 h-24 mx-auto text-slate-600 dark:text-slate-500" />
              <p className="mt-4 text-slate-400">{t('barcode.noResult', 'Start the camera or upload an image to begin scanning.')}</p>
            </div>
          )}
        </div>

        <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('barcode.controlsTitle', 'Controls')}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {!isScanning ? (
                <button onClick={handleStartCamera} className="h-14 rounded-xl bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-3 hover:bg-violet-700 transition-all shadow-lg"><Camera className="w-5 h-5" /><span>{t('barcode.startCamera', 'Start Camera')}</span></button>
              ) : (
                <button onClick={stopScan} className="h-14 rounded-xl bg-rose-600 text-white text-sm font-bold flex items-center justify-center gap-3 hover:bg-rose-700 transition-all shadow-lg"><X className="w-5 h-5" /><span>{t('barcode.stopCamera', 'Stop Camera')}</span></button>
              )}
              <label className="h-14 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-300 text-sm font-bold flex items-center justify-center gap-3 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all cursor-pointer"><Upload className="w-5 h-5" /><span>{t('barcode.scanImage', 'Scan Image')}</span><input type="file" accept="image/*" onChange={handleImageScan} className="hidden" /></label>
            </div>
            <div className="mt-6">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('barcode.pasteLabel', 'Or paste content to scan')}</label>
              <div className="mt-2 flex gap-2"><textarea value={pastedContent} onChange={(e) => setPastedContent(e.target.value)} placeholder={t('barcode.pastePlaceholder', 'Paste a URL to an image or barcode data')} className="flex-grow p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm" rows={2} /><button onClick={handlePasteScan} className="h-full px-4 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"><ClipboardPaste className="w-5 h-5" /></button></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('barcode.resultTitle', 'Scan Result')}</h3>
            <div className="p-4 min-h-[100px] rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-700 dark:text-slate-300 break-all flex items-center justify-center">
              {error ? (<div className="text-center text-rose-500"><AlertTriangle className="w-8 h-8 mx-auto mb-2" /><p>{error}</p></div>) : result ? (<p>{result}</p>) : (<p className="text-slate-400 dark:text-slate-500">{t('barcode.noResultShort', 'No code detected.')}</p>)}
            </div>
            <div className="pt-2 grid grid-cols-3 gap-4">
              <button onClick={handleCopy} disabled={!result} className="h-12 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed"><Copy className="w-4 h-4" /><span>{t('common.copy', 'Copy')}</span></button>
              <button onClick={handleSave} disabled={!result} className="h-12 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed"><Save className="w-4 h-4" /><span>{t('common.save', 'Save')}</span></button>
              <button onClick={handleClear} className="h-12 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 text-sm font-bold flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition"><X className="w-4 h-4" /><span>{t('common.clear', 'Clear')}</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}