export type ServiceTier = "live" | "electron" | "web" | "guarded" | "planned";

export interface ProductionService {
  id: string;
  title: string;
  category: "AI" | "Clipboard" | "Security" | "Storage" | "System" | "Experience";
  tier: ServiceTier;
  status: "ACTIVE" | "READY" | "GUARDED" | "NEXT";
  description: string;
  channel?: string;
}

export const PRODUCTION_SERVICES: ProductionService[] = [
  {
    id: "openrouter-live",
    title: "OpenRouter Live AI Bridge",
    category: "AI",
    tier: "live",
    status: "ACTIVE",
    channel: "/api/ai/[action] + window.knoux.ai",
    description: "Server-side Vercel route and Electron helper for summarization, rewrite, translation, classification, extraction, reply drafting, and code analysis."
  },
  {
    id: "ai-fallback",
    title: "Deterministic Offline AI Fallback",
    category: "AI",
    tier: "guarded",
    status: "READY",
    channel: "knoux-local-fallback",
    description: "Safe local result generator that keeps the product usable when OpenRouter keys are not configured or a network request fails."
  },
  {
    id: "clipboard-core",
    title: "Clipboard Command Core",
    category: "Clipboard",
    tier: "electron",
    status: "ACTIVE",
    channel: "clipboard:*",
    description: "Electron IPC channels for add, copy, normalize, format, search, monitoring, stats, and local write-through operations."
  },
  {
    id: "vault-aes",
    title: "AES-256-GCM Vault Bridge",
    category: "Security",
    tier: "electron",
    status: "ACTIVE",
    channel: "security:encrypt / security:decrypt",
    description: "Production encryption bridge using AES-256-GCM with authenticated payloads and explicit secure payload format."
  },
  {
    id: "credential-shield",
    title: "Credential Shield Scanner",
    category: "Security",
    tier: "web",
    status: "ACTIVE",
    channel: "security:detect:sensitive",
    description: "Detects API-key-like values, emails, and phone-number patterns before content is stored or reused."
  },
  {
    id: "memory-store",
    title: "Local Memory Store Adapter",
    category: "Storage",
    tier: "electron",
    status: "READY",
    channel: "storage:*",
    description: "Runtime key-value adapter for save, load, export, import, and stats. Ready to be swapped to SQLite persistence in the next database sprint."
  },
  {
    id: "health-monitor",
    title: "System Health Monitor",
    category: "System",
    tier: "electron",
    status: "ACTIVE",
    channel: "system:* / monitoring:stats",
    description: "Reports memory, uptime, service health, feature flags, monitoring status, and basic OS profile."
  },
  {
    id: "ui-morpher",
    title: "KNOUX UI Morpher",
    category: "Experience",
    tier: "guarded",
    status: "READY",
    channel: "ai:uimorpher:transform",
    description: "Controlled theme transformation endpoint for future workspace themes while preserving the current premium light KNOUX identity."
  },
  {
    id: "voice-vision",
    title: "Voice / Vision Provider Slots",
    category: "Experience",
    tier: "planned",
    status: "NEXT",
    channel: "ai:voice:* / ai:visual:*",
    description: "Provider-safe slots for future speech commands, OCR, and vision analysis. They now return explicit status instead of fake success."
  }
];

export const PRODUCTION_SCORE = {
  webDeploy: 100,
  openRouterBridge: 95,
  electronBridge: 92,
  securityVault: 90,
  sqlitePersistence: 72,
  serviceTransparency: 96
};

export function countServicesByStatus(status: ProductionService["status"]) {
  return PRODUCTION_SERVICES.filter((service) => service.status === status).length;
}

export function getServiceReadinessPercent() {
  const weights: Record<ProductionService["status"], number> = {
    ACTIVE: 1,
    READY: 0.85,
    GUARDED: 0.7,
    NEXT: 0.35
  };

  const total = PRODUCTION_SERVICES.reduce((sum, service) => sum + weights[service.status], 0);
  return Math.round((total / PRODUCTION_SERVICES.length) * 100);
}
