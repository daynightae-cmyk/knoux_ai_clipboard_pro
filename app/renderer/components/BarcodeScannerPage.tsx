import { useRef, useState } from "react";
import { Camera, ImageUp, QrCode, Copy, CheckCircle, AlertTriangle } from "lucide-react";

interface BarcodeScannerPageProps {
  onAddNewItem?: (content: string, type: "text" | "link" | "note", source?: string) => Promise<void> | void;
}

const formats = ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e", "pdf417", "data_matrix"];

export default function BarcodeScannerPage({ onAddNewItem }: BarcodeScannerPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState("Ready to scan using the browser BarcodeDetector API.");
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const commitResult = async (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setResult(clean);
    setStatus("Barcode decoded successfully.");
    await onAddNewItem?.(clean, clean.startsWith("http") ? "link" : "note", "Barcode Scanner");
  };

  const startCamera = async () => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      setStatus("BarcodeDetector is not supported in this browser. Use image upload or paste the decoded value manually.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setStatus("Camera active. Point it at a QR code or barcode.");
      const detector = new Detector({ formats });

      const loop = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.[0]?.rawValue) {
            await commitResult(codes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          setStatus("Scanning is active, waiting for a clear code frame.");
        }
        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    } catch {
      setStatus("Camera permission denied or unavailable.");
      stopCamera();
    }
  };

  const scanImage = async (file: File) => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      setStatus("BarcodeDetector is not supported in this browser.");
      return;
    }

    const image = new Image();
    image.onload = async () => {
      try {
        const detector = new Detector({ formats });
        const codes = await detector.detect(image);
        if (codes?.[0]?.rawValue) await commitResult(codes[0].rawValue);
        else setStatus("No readable barcode found in this image.");
      } catch {
        setStatus("Could not read this image. Try a sharper QR/barcode.");
      } finally {
        URL.revokeObjectURL(image.src);
      }
    };
    image.src = URL.createObjectURL(file);
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setStatus("Decoded value copied to clipboard.");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl p-6 shadow-knoux-glow space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D8B8EC]/20 bg-[#8A2BE2]/15 text-[11px] font-black text-[#D8B8EC] uppercase tracking-widest"><QrCode className="w-4 h-4" /> KNOUX Barcode Scanner</div>
        <h2 className="text-3xl font-black text-white">Real QR and barcode scanning for clipboard workflows.</h2>
        <p className="text-sm text-[#BFA7DB] max-w-3xl">Use the camera or upload an image. Detected values are copied into the KNOUX clipboard workspace and can be sent to AI tools, search, or secure storage.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/25 overflow-hidden min-h-[360px] flex items-center justify-center relative">
          <video ref={videoRef} className="w-full h-full min-h-[360px] object-cover" muted playsInline />
          {!scanning && <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"><QrCode className="w-16 h-16 text-[#D8B8EC] mb-4" /><p className="text-[#BFA7DB] text-sm">Camera preview appears here after permission.</p></div>}
        </div>

        <aside className="space-y-4">
          <button onClick={scanning ? stopCamera : startCamera} className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#8A2BE2] to-[#D946EF] text-white font-black flex items-center justify-center gap-2"><Camera className="w-4 h-4" />{scanning ? "Stop Camera" : "Start Camera Scan"}</button>
          <label className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.06] text-[#D8B8EC] font-black flex items-center justify-center gap-2 cursor-pointer"><ImageUp className="w-4 h-4" /> Scan Image<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && scanImage(e.target.files[0])} /></label>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 space-y-3">
            <div className="text-xs font-black uppercase text-[#BFA7DB]">Status</div>
            <div className="flex gap-2 text-sm text-white"><AlertTriangle className="w-4 h-4 text-[#D8B8EC] shrink-0 mt-0.5" />{status}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 space-y-3">
            <div className="text-xs font-black uppercase text-[#BFA7DB]">Decoded Result</div>
            <textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Decoded barcode value appears here..." className="w-full h-32 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white outline-none" />
            <div className="grid grid-cols-2 gap-2"><button onClick={copyResult} className="h-10 rounded-xl bg-white/[0.08] text-white text-xs font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copy</button><button onClick={() => commitResult(result)} className="h-10 rounded-xl bg-emerald-400/15 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Save</button></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
