import { useEffect } from "react";

interface Props { language?: string; }

const AR: Record<string, string> = {
  "Workspace Overview": "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0639\u0645\u0644",
  "Clipboard Hub": "\u0645\u0631\u0643\u0632 \u0627\u0644\u062d\u0627\u0641\u0638\u0629",
  "Deep Search": "\u0628\u062d\u062b \u0639\u0645\u064a\u0642",
  "AI Assistant": "\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u0627\u0621",
  "Barcode Scanner": "\u0645\u0627\u0633\u062d \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f",
  "Security & Vault": "\u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u062e\u0632\u0646\u0629",
  "Settings": "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
  "Developer Studio": "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0645\u0637\u0648\u0631\u064a\u0646",
  "Experimental Labs": "\u0645\u062e\u062a\u0628\u0631\u0627\u062a \u0645\u062a\u0642\u062f\u0645\u0629",
  "About KNOUX": "\u0639\u0646 \u0643\u0646\u0648\u0643\u0633",
  "KNOUX Developer Studio": "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0645\u0637\u0648\u0631\u064a \u0643\u0646\u0648\u0643\u0633",
  "Developer Control Deck": "\u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645 \u0627\u0644\u0645\u0637\u0648\u0631\u064a\u0646",
  "Service Reality Matrix": "\u0645\u0635\u0641\u0648\u0641\u0629 \u0648\u0627\u0642\u0639 \u0627\u0644\u062e\u062f\u0645\u0627\u062a",
  "AI Route Diagnostics": "\u062a\u0634\u062e\u064a\u0635 \u0645\u0633\u0627\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
  "Customer Writing & Service Control Panel": "\u0644\u0648\u062d\u0629 \u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u0639\u0645\u064a\u0644 \u0648\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u062e\u062f\u0645\u0627\u062a",
  "Real QR and barcode scanning for clipboard workflows.": "\u0645\u0633\u062d QR \u0648\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062f \u0641\u0639\u0644\u064a\u064b\u0627 \u0644\u062a\u062f\u0641\u0642\u0627\u062a \u0627\u0644\u062d\u0627\u0641\u0638\u0629.",
  "Start ZXing Camera Scan": "\u0628\u062f\u0621 \u0645\u0633\u062d \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 ZXing",
  "Stop Camera": "\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627",
  "Scan Uploaded Image": "\u0641\u062d\u0635 \u0635\u0648\u0631\u0629 \u0645\u0631\u0641\u0648\u0639\u0629",
  "Scan Clipboard Image": "\u0641\u062d\u0635 \u0635\u0648\u0631\u0629 \u0645\u0646 \u0627\u0644\u062d\u0627\u0641\u0638\u0629",
  "Refresh Cameras": "\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627\u062a",
  "Camera preview appears here.": "\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u062a\u0638\u0647\u0631 \u0647\u0646\u0627.",
  "Decoded / Manual Value": "\u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629 / \u0627\u0644\u064a\u062f\u0648\u064a\u0629",
  "Copy": "\u0646\u0633\u062e",
  "Save": "\u062d\u0641\u0638",
  "Run": "\u062a\u0634\u063a\u064a\u0644",
  "Use Sample": "\u0627\u0633\u062a\u062e\u062f\u0645 \u0639\u064a\u0646\u0629",
  "Ready": "\u062c\u0627\u0647\u0632",
  "Active": "\u0646\u0634\u0637",
  "Guarded": "\u0645\u062d\u0645\u064a",
  "Planned": "\u0645\u062e\u0637\u0637",
  "Status": "\u0627\u0644\u062d\u0627\u0644\u0629",
  "Provider": "\u0627\u0644\u0645\u0632\u0648\u062f",
  "Model": "\u0627\u0644\u0646\u0645\u0648\u0630\u062c",
  "Today": "\u0627\u0644\u064a\u0648\u0645",
  "Yesterday": "\u0623\u0645\u0633",
  "This Week": "\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639",
  "Older": "\u0623\u0642\u062f\u0645",
  "Clean Text": "\u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0646\u0635",
  "Extract": "\u0627\u0633\u062a\u062e\u0631\u0627\u062c",
  "Export": "\u062a\u0635\u062f\u064a\u0631",
  "New Snippet": "\u0645\u0642\u0637\u0639 \u062c\u062f\u064a\u062f",
  "All Clips": "\u0643\u0644 \u0627\u0644\u0645\u0642\u0627\u0637\u0639",
  "Collections": "\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0627\u062a",
  "Input": "\u0627\u0644\u0625\u062f\u062e\u0627\u0644",
  "AI Result": "\u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0630\u0643\u0627\u0621",
  "Summarize": "\u062a\u0644\u062e\u064a\u0635",
  "Rewrite": "\u0625\u0639\u0627\u062f\u0629 \u0635\u064a\u0627\u063a\u0629",
  "Translate": "\u062a\u0631\u062c\u0645\u0629",
  "Analyze": "\u062a\u062d\u0644\u064a\u0644",
  "Format": "\u062a\u0646\u0633\u064a\u0642",
  "Theme": "\u0627\u0644\u0633\u0645\u0629",
  "Day": "\u0646\u0647\u0627\u0631\u064a",
  "Night": "\u0644\u064a\u0644\u064a",
  "System": "\u0627\u0644\u0646\u0638\u0627\u0645",
  "Language": "\u0627\u0644\u0644\u063a\u0629",
  "Arabic": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  "English": "\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629"
};

const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "INPUT", "OPTION"]);

function restore() {
  document.querySelectorAll<HTMLElement>("[data-i18n-original]").forEach((el) => {
    el.textContent = el.dataset.i18nOriginal || el.textContent;
    delete el.dataset.i18nOriginal;
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", el.dataset.i18nPlaceholder || "");
    delete el.dataset.i18nPlaceholder;
  });
}

function findTranslation(value: string) {
  return AR[value.replace(/\s+/g, " ").trim()] || null;
}

function translateNow() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) { nodes.push(node as Text); node = walker.nextNode(); }
  nodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || SKIP.has(parent.tagName) || parent.dataset.i18nOriginal) return;
    const original = textNode.textContent || "";
    const translated = findTranslation(original);
    if (!translated) return;
    parent.dataset.i18nOriginal = original;
    textNode.textContent = original.replace(original.trim(), translated);
  });
  document.querySelectorAll<HTMLElement>("[placeholder]").forEach((el) => {
    const original = el.getAttribute("placeholder") || "";
    if (el.dataset.i18nPlaceholder) return;
    const translated = findTranslation(original);
    if (!translated) return;
    el.dataset.i18nPlaceholder = original;
    el.setAttribute("placeholder", translated);
  });
}

export default function RuntimeLanguageBridge({ language = "en" }: Props) {
  useEffect(() => {
    restore();
    if (language !== "ar") return;
    translateNow();
    const observer = new MutationObserver(() => window.requestAnimationFrame(translateNow));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
