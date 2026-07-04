import { useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, ImageUp, QrCode, Copy, CheckCircle, AlertTriangle } from "lucide-react";

interface BarcodeScannerPageProps {
  onAddNewItem?: (content: string, type: "text" | "link" | "note", source?: string) => Promise<void> | void;
}

export default function BarcodeScannerPage({ onAddNewItem }: BarcodeScannerPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const readerRef = useRef(new BrowserMultiFormatReader());
  const [status, setStatus] = useState("ZXing scanner ready.");
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);

  const saveValue = async (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setResult(clean);
    setStatus("Decoded successfully.");
    await onAddNewItem?.(clean, clean.startsWith("http") ? "link" : "note", "ZXing Barcode Scanner");
  };

  const stopCamera = () => {
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    setScanning(false);
    setStatus("Camera stopped.");
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      setStatus("Camera active. Show a QR or barcode.");
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(undefined, videoRef.current!, async (decoded, _error, controls) => {
        if (decoded) {
          controls.stop();
          controlsRef.current = null;
          setScanning(false);
          await saveValue(decoded.getText());
        }
      });
    } catch (error: any) {
      setScanning(false);
      setStatus(error?.message || "Camera unavailable. Use image upload.");
    }
  };

  const scanImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      setStatus("Reading image...");
      const decoded = await readerRef.current.decodeFromImageUrl(url);
      await saveValue(decoded.getText());
    } catch (error: any) {
      setStatus(error?.message || "No readable code found.");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setStatus("Copied.");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <section className="rounded-3xl border border-knoux-purple/10 bg-gradient-to-r from-white via-knoux-lavender-white to-white p-6 shadow-knoux-glow space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><QrCode className="w-4 h-4" /> KNOUX ZXing Scanner</div>
        <h2 className="text-3xl font-black text-knoux-dark-text">Real QR and barcode scanning.</h2>
        <p className="text-sm text-knoux-muted-text max-w-3xl">Camera and image scanning now use ZXing instead of unsupported desktop BarcodeDetector.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-3xl border border-knoux-purple/10 bg-white overflow-hidden min-h-[390px] flex items-center justify-center relative shadow-sm">
          <video ref={videoRef} className="w-full h-full min-h-[390px] object-cover" muted playsInline />
          {!scanning && <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"><QrCode className="w-16 h-16 text-knoux-purple mb-4" /><p className="text-knoux-muted-text text-sm font-bold">Camera preview appears here after permission.</p></div>}
        </div>

        <aside className="space-y-4">
          <button onClick={scanning ? stopCamera : startCamera} className="w-full h-12 rounded-2xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white font-black flex items-center justify-center gap-2"><Camera className="w-4 h-4" />{scanning ? "Stop Camera" : "Start Camera Scan"}</button>
          <label className="w-full h-12 rounded-2xl border border-knoux-purple/15 bg-white text-knoux-purple font-black flex items-center justify-center gap-2 cursor-pointer"><ImageUp className="w-4 h-4" /> Scan Image<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && scanImage(e.target.files[0])} /></label>
          <div className="rounded-3xl border border-knoux-purple/10 bg-white p-4 space-y-3"><div className="text-xs font-black uppercase text-knoux-muted-text">Status</div><div className="flex gap-2 text-sm text-knoux-dark-text font-semibold"><AlertTriangle className="w-4 h-4 text-knoux-purple shrink-0 mt-0.5" />{status}</div></div>
          <div className="rounded-3xl border border-knoux-purple/10 bg-white p-4 space-y-3"><div className="text-xs font-black uppercase text-knoux-muted-text">Decoded Result</div><textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Decoded value appears here..." className="w-full h-32 rounded-2xl border border-knoux-purple/10 bg-[#FCFAFF] p-3 text-xs text-knoux-dark-text outline-none" /><div className="grid grid-cols-2 gap-2"><button onClick={copyResult} className="h-10 rounded-xl bg-knoux-purple/5 text-knoux-purple text-xs font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copy</button><button onClick={() => saveValue(result)} className="h-10 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Save</button></div></div>
        </aside>
      </div>
    </div>
  );
}
