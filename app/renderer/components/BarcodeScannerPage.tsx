import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle, ClipboardImage, Copy, ImageUp, Keyboard, QrCode, RefreshCw, StopCircle } from "lucide-react";

interface BarcodeScannerPageProps {
  onAddNewItem?: (content: string, type: "text" | "link" | "note", source?: string) => Promise<void> | void;
}

type ScanStatus = "ready" | "active" | "success" | "warning" | "error";

const cleanDecodedText = (value: unknown) => String(value || "").trim();
const isLinkValue = (value: string) => /^https?:\/\//i.test(value);

export default function BarcodeScannerPage({ onAddNewItem }: BarcodeScannerPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop?: () => void } | null>(null);
  const [status, setStatus] = useState("Ready. Choose a camera, start live scan, upload an image, or paste a value manually.");
  const [statusTone, setStatusTone] = useState<ScanStatus>("ready");
  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [lastDecodedAt, setLastDecodedAt] = useState("");

  const setMessage = (message: string, tone: ScanStatus = "ready") => {
    setStatus(message);
    setStatusTone(tone);
  };

  const stopCamera = () => {
    try { controlsRef.current?.stop?.(); } catch { /* scanner is already stopped */ }
    controlsRef.current = null;
    setScanning(false);
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks?.().forEach((track) => track.stop());
    if (video) video.srcObject = null;
  };

  const refreshCameras = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      if (!deviceId && videoDevices[0]?.deviceId) setDeviceId(videoDevices[0].deviceId);
      setMessage(videoDevices.length ? `${videoDevices.length} camera device(s) detected.` : "No camera devices were detected. Use image upload or manual paste.", videoDevices.length ? "ready" : "warning");
    } catch (error: any) {
      setMessage(error?.message || "Unable to enumerate camera devices.", "warning");
    }
  };

  useEffect(() => {
    refreshCameras();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitResult = async (value: string) => {
    const clean = cleanDecodedText(value);
    if (!clean) { setMessage("No decoded value to save. Scan, upload, or paste a value first.", "warning"); return; }
    setResult(clean);
    setLastDecodedAt(new Date().toLocaleTimeString());
    setMessage("Decoded value saved into the KNOUX clipboard workspace.", "success");
    await onAddNewItem?.(clean, isLinkValue(clean) ? "link" : "note", "Barcode Scanner");
  };

  const handleDecoded = async (raw: unknown) => {
    const text = cleanDecodedText((raw as any)?.getText?.() || (raw as any)?.text || raw);
    if (!text) return false;
    setResult(text);
    setLastDecodedAt(new Date().toLocaleTimeString());
    setMessage("Barcode decoded successfully. Saved into the workspace.", "success");
    await onAddNewItem?.(text, isLinkValue(text) ? "link" : "note", "Barcode Scanner");
    stopCamera();
    return true;
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setMessage("Camera access is unavailable in this browser. Use image upload or manual paste.", "error"); return; }
    stopCamera();
    setMessage("Requesting camera permission and starting live ZXing decoding...", "active");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader: any = new BrowserMultiFormatReader();
      const video = videoRef.current;
      if (!video) { setMessage("Camera preview is not ready. Reopen the scanner and try again.", "error"); return; }
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      };
      const onFrame = async (scanResult: any, scanError: any) => {
        if (scanResult && await handleDecoded(scanResult)) return;
        const errorName = scanError?.name || scanError?.constructor?.name || "";
        if (errorName && !["NotFoundException", "ChecksumException", "FormatException"].includes(errorName)) setMessage(`Camera is active. Improve lighting or move closer. ${errorName}`, "warning");
      };
      const controls = typeof reader.decodeFromConstraints === "function" ? await reader.decodeFromConstraints(constraints, video, onFrame) : await reader.decodeFromVideoDevice(deviceId || undefined, video, onFrame);
      controlsRef.current = controls || reader;
      setScanning(true);
      await refreshCameras();
      setMessage("Camera active. Point at a QR code or barcode. Frames are decoded locally.", "active");
    } catch (error: any) {
      stopCamera();
      const message = error?.name === "NotAllowedError" ? "Camera permission denied. Enable camera permission from the browser address bar, then press Start again." : error?.message || "ZXing scanner failed to start. Use image upload or manual paste.";
      setMessage(message, "error");
    }
  };

  const scanImageUrl = async (url: string) => {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const reader: any = new BrowserMultiFormatReader();
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => undefined);
    const scanResult = typeof reader.decodeFromImageElement === "function" ? await reader.decodeFromImageElement(img) : await reader.decodeFromImageUrl(url);
    const text = cleanDecodedText(scanResult?.getText?.() || scanResult?.text || scanResult);
    if (!text) throw new Error("No readable barcode or QR code was found.");
    await commitResult(text);
  };

  const scanImage = async (file: File) => {
    if (!file) return;
    setMessage("Decoding uploaded image with ZXing locally...", "active");
    const url = URL.createObjectURL(file);
    try { await scanImageUrl(url); }
    catch (error: any) { setMessage(error?.message || "No readable barcode or QR code was found. Try a sharper image.", "error"); }
    finally { URL.revokeObjectURL(url); }
  };

  const scanClipboardImage = async () => {
    const nav: any = navigator;
    if (!nav.clipboard?.read) { setMessage("Clipboard image scan is not available in this browser. Upload an image instead.", "warning"); return; }
    try {
      const entries = await nav.clipboard.read();
      for (const entry of entries) {
        const imageType = entry.types.find((type: string) => type.startsWith("image/"));
        if (!imageType) continue;
        const blob = await entry.getType(imageType);
        await scanImage(new File([blob], "clipboard-image.png", { type: imageType }));
        return;
      }
      setMessage("No image found in the system clipboard.", "warning");
    } catch (error: any) { setMessage(error?.message || "Clipboard image permission was denied.", "error"); }
  };

  const copyResult = async () => {
    const clean = cleanDecodedText(result);
    if (!clean) { setMessage("There is no decoded value to copy yet.", "warning"); return; }
    await navigator.clipboard.writeText(clean);
    setMessage("Decoded value copied to the system clipboard.", "success");
  };

  const statusClass = {
    ready: "bg-[#fcfaff] text-knoux-muted-text border-knoux-purple/10",
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-knoux-purple/10 bg-knoux-purple/5 text-[11px] font-black text-knoux-purple uppercase tracking-widest"><QrCode className="w-4 h-4" /> KNOUX Barcode Scanner</div>
          <h2 className="text-3xl font-black text-knoux-dark-text">Real QR and barcode scanning for clipboard workflows.</h2>
          <p className="text-sm text-knoux-muted-text max-w-3xl">Camera scan, image upload scan, clipboard-image scan, manual paste fallback, copy, and save-to-workspace are all local-first. No decoded value is sent to a server by this scanner page.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="rounded-3xl border border-knoux-purple/10 bg-[#150821] overflow-hidden min-h-[430px] flex items-center justify-center relative shadow-knoux-glow">
          <video ref={videoRef} className="w-full h-full min-h-[430px] object-cover" muted playsInline autoPlay />
          {!scanning && <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_center,rgba(138,43,226,.22),rgba(13,5,39,.96))]"><QrCode className="w-16 h-16 text-[#CFB4EA] mb-4" /><p className="text-[#FCFAFF] font-black">Camera preview appears here.</p><p className="text-[#CFB4EA] text-sm mt-2 max-w-md">Use camera scan for live QR/barcode reading, upload an image, or scan an image copied to the clipboard.</p></div>}
        </div>

        <aside className="space-y-4">
          <div className="glass-panel p-4 space-y-3"><div className="text-xs font-black uppercase tracking-widest text-knoux-muted-text">Camera</div><select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full h-11 rounded-2xl border border-knoux-purple/10 bg-white p-2 text-xs text-knoux-dark-text outline-none focus:border-knoux-purple/40"><option value="">Auto / Environment camera</option>{devices.map((device, index) => <option key={device.deviceId || index} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}</select><button onClick={refreshCameras} className="w-full h-10 rounded-xl border border-knoux-purple/10 bg-white text-knoux-purple text-xs font-bold flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh Cameras</button></div>
          <button onClick={scanning ? stopCamera : startCamera} className="w-full h-12 rounded-2xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white font-black flex items-center justify-center gap-2 shadow-knoux-glow hover:shadow-knoux-glow-lg transition">{scanning ? <StopCircle className="w-4 h-4" /> : <Camera className="w-4 h-4" />}{scanning ? "Stop Camera" : "Start ZXing Camera Scan"}</button>
          <label className="w-full h-12 rounded-2xl border border-knoux-purple/15 bg-white text-knoux-purple font-black flex items-center justify-center gap-2 cursor-pointer hover:border-knoux-purple/30 transition"><ImageUp className="w-4 h-4" /> Scan Uploaded Image<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && scanImage(e.target.files[0])} /></label>
          <button onClick={scanClipboardImage} className="w-full h-12 rounded-2xl border border-knoux-purple/15 bg-white text-knoux-purple font-black flex items-center justify-center gap-2 hover:border-knoux-purple/30 transition"><ClipboardImage className="w-4 h-4" /> Scan Clipboard Image</button>
          <div className={`rounded-3xl border p-4 space-y-3 ${statusClass}`}><div className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Status</div><div className="text-sm font-semibold leading-6">{status}</div>{lastDecodedAt && <div className="text-[11px] opacity-80">Last decoded value: {lastDecodedAt}</div>}</div>
          <div className="glass-panel p-4 space-y-3"><div className="text-xs font-black uppercase tracking-widest text-knoux-muted-text flex items-center gap-2"><Keyboard className="w-4 h-4 text-knoux-purple" /> Decoded / Manual Value</div><textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Decoded barcode value appears here, or paste a value manually..." className="w-full h-36 rounded-2xl border border-knoux-purple/10 bg-white p-3 text-xs text-knoux-dark-text outline-none focus:border-knoux-purple/40" /><div className="grid grid-cols-2 gap-2"><button onClick={copyResult} className="h-10 rounded-xl border border-knoux-purple/10 bg-white text-knoux-purple text-xs font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copy</button><button onClick={() => commitResult(result)} className="h-10 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Save</button></div></div>
        </aside>
      </div>
    </div>
  );
}
