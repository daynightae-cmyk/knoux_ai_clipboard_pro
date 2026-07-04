import { useRef, useState } from "react";
import { Camera, ImageUp, QrCode, Copy, CheckCircle, AlertTriangle, Keyboard, StopCircle } from "lucide-react";

interface BarcodeScannerPageProps {
  onAddNewItem?: (content: string, type: "text" | "link" | "note", source?: string) => Promise<void> | void;
}

type ScanStatus = "ready" | "active" | "success" | "warning" | "error";

const cleanDecodedText = (value: unknown) => String(value || "").trim();
const isLinkValue = (value: string) => /^https?:\/\//i.test(value);

export default function BarcodeScannerPage({ onAddNewItem }: BarcodeScannerPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop?: () => void } | null>(null);
  const [status, setStatus] = useState("Ready. ZXing scanner is available with manual paste fallback.");
  const [statusTone, setStatusTone] = useState<ScanStatus>("ready");
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);

  const setMessage = (message: string, tone: ScanStatus = "ready") => {
    setStatus(message);
    setStatusTone(tone);
  };

  const stopCamera = () => {
    try {
      controlsRef.current?.stop?.();
    } catch {
      // Scanner was already stopped by the browser or ZXing control bridge.
    }
    controlsRef.current = null;
    setScanning(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const commitResult = async (value: string) => {
    const clean = cleanDecodedText(value);
    if (!clean) {
      setMessage("No decoded value to save. Scan, upload, or paste a value first.", "warning");
      return;
    }

    setResult(clean);
    setMessage("Decoded value saved into the KNOUX clipboard workspace.", "success");
    await onAddNewItem?.(clean, isLinkValue(clean) ? "link" : "note", "Barcode Scanner");
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera access is unavailable in this browser. Use image upload or manual paste.", "error");
      return;
    }

    stopCamera();
    setMessage("Starting ZXing camera scanner. Allow camera permission if prompted.", "active");

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader: any = new BrowserMultiFormatReader();
      const videoElement = videoRef.current;

      if (!videoElement) {
        setMessage("Camera preview is not ready. Reopen the scanner and try again.", "error");
        return;
      }

      const controls = await reader.decodeFromVideoDevice(undefined, videoElement, async (scanResult: any, scanError: any) => {
        const text = cleanDecodedText(scanResult?.getText?.() || scanResult?.text || scanResult);
        if (text) {
          await commitResult(text);
          stopCamera();
          return;
        }

        const errorName = scanError?.name || "";
        if (errorName && errorName !== "NotFoundException") {
          setMessage(`Camera active. Waiting for a clearer frame. ${errorName}`, "warning");
        }
      });

      controlsRef.current = controls || reader;
      setScanning(true);
      setMessage("Camera active. Point at a QR code or barcode. ZXing is decoding frames locally.", "active");
    } catch (error: any) {
      stopCamera();
      const message = error?.name === "NotAllowedError"
        ? "Camera permission denied. Enable camera access or use image upload/manual paste."
        : error?.message || "ZXing scanner failed to start. Use image upload or manual paste.";
      setMessage(message, "error");
    }
  };

  const scanImage = async (file: File) => {
    if (!file) return;
    setMessage("Decoding uploaded image with ZXing locally...", "active");
    const url = URL.createObjectURL(file);

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader: any = new BrowserMultiFormatReader();
      const scanResult = await reader.decodeFromImageUrl(url);
      const text = cleanDecodedText(scanResult?.getText?.() || scanResult?.text || scanResult);

      if (text) await commitResult(text);
      else setMessage("No readable barcode or QR code was found in this image.", "warning");
    } catch (error: any) {
      setMessage(error?.message || "No readable barcode or QR code was found. Try a sharper image.", "error");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const copyResult = async () => {
    const clean = cleanDecodedText(result);
    if (!clean) {
      setMessage("There is no decoded value to copy yet.", "warning");
      return;
    }

    await navigator.clipboard.writeText(clean);
    setMessage("Decoded value copied to the system clipboard.", "success");
  };

  const statusClass = {
    ready: "bg-white text-knoux-muted-text border-knoux-purple/10",
    active: "bg-violet-50 text-violet-800 border-violet-100",
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
    warning: "bg-amber-50 text-amber-800 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
  }[statusTone];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto select-none">
      <section className="glass-elevated p-6 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-knoux-purple/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest">
            <QrCode className="w-4 h-4" /> KNOUX Barcode Scanner
          </div>
          <h2 className="text-3xl font-black text-knoux-dark-text">Real QR and barcode scanning for clipboard workflows.</h2>
          <p className="text-sm text-knoux-muted-text max-w-3xl">
            Camera scan, image upload scan, manual paste fallback, copy, and save-to-workspace are all local-first. No decoded value is sent to a server by this scanner page.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="rounded-3xl border border-knoux-purple/10 bg-[#150821] overflow-hidden min-h-[380px] flex items-center justify-center relative shadow-knoux-glow">
          <video ref={videoRef} className="w-full h-full min-h-[380px] object-cover" muted playsInline />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_center,rgba(138,43,226,.22),rgba(13,5,39,.96))]">
              <QrCode className="w-16 h-16 text-[#CFB4EA] mb-4" />
              <p className="text-[#FCFAFF] font-black">Camera preview appears here.</p>
              <p className="text-[#CFB4EA] text-sm mt-2 max-w-md">Use camera scan for live QR/barcode reading, or upload an image from the side panel.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <button onClick={scanning ? stopCamera : startCamera} className="w-full h-12 rounded-2xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white font-black flex items-center justify-center gap-2 shadow-knoux-glow hover:shadow-knoux-glow-lg transition">
            {scanning ? <StopCircle className="w-4 h-4" /> : <Camera className="w-4 h-4" />}{scanning ? "Stop Camera" : "Start ZXing Camera Scan"}
          </button>

          <label className="w-full h-12 rounded-2xl border border-knoux-purple/15 bg-white text-knoux-purple font-black flex items-center justify-center gap-2 cursor-pointer hover:border-knoux-purple/30 transition">
            <ImageUp className="w-4 h-4" /> Scan Uploaded Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && scanImage(e.target.files[0])} />
          </label>

          <div className={`rounded-3xl border p-4 space-y-3 ${statusClass}`}>
            <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Status</div>
            <div className="text-sm font-semibold leading-6">{status}</div>
          </div>

          <div className="glass-panel p-4 space-y-3">
            <div className="text-xs font-black uppercase tracking-widest text-knoux-muted-text flex items-center gap-2"><Keyboard className="w-4 h-4 text-knoux-purple" /> Decoded / Manual Value</div>
            <textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Decoded barcode value appears here, or paste a value manually..." className="w-full h-36 rounded-2xl border border-knoux-purple/10 bg-white p-3 text-xs text-knoux-dark-text outline-none focus:border-knoux-purple/40" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyResult} className="h-10 rounded-xl border border-knoux-purple/10 bg-white text-knoux-purple text-xs font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={() => commitResult(result)} className="h-10 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
