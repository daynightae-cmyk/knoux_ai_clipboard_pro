export type ServiceStatus = "Active" | "Ready" | "Guarded" | "Planned" | "Missing" | "Disabled";

export interface ProductionService {
  id: string;
  displayName: string;
  title: string;
  category: string;
  status: ServiceStatus;
  runtimeType: string;
  tier: "live" | "guarded" | "planned";
  dependency: string;
  implemented: boolean;
  requiresConfig: boolean;
  userFallback: string;
  fallback: string;
  actionHandler: string;
  description: string;
  channel: string;
}

// Dummy data for demonstration
export const PRODUCTION_SERVICES: ProductionService[] = [
  {
    id: "ai-summarize",
    displayName: "AI Summarization",
    title: "AI Summarization",
    category: "AI",
    status: "Ready",
    runtimeType: "server-route",
    tier: "live",
    dependency: "OpenRouter",
    implemented: true,
    requiresConfig: true,
    userFallback: "AI provider must be configured in settings.",
    fallback: "AI provider must be configured in settings.",
    actionHandler: "ai:summarize",
    description: "Generates a concise summary of the selected clipboard text using an AI model.",
    channel: "ai:summarize",
  },
  {
    id: "cloud-sync",
    displayName: "Cloud Sync",
    title: "Cloud Sync",
    category: "Storage",
    status: "Planned",
    runtimeType: "cloud-backend",
    tier: "planned",
    dependency: "Knoux Cloud",
    implemented: false,
    requiresConfig: true,
    userFallback: "Real-time cloud synchronization is planned for a future release.",
    fallback: "Real-time cloud synchronization is planned for a future release.",
    actionHandler: "cloud:sync",
    description: "Sync your clipboard history across devices. Requires a Knoux account.",
    channel: "cloud:sync",
  },
];

export const getServiceReadinessPercent = () => 75;
export const PRODUCTION_SCORE = {
  score: getServiceReadinessPercent(),
  securityVault: getServiceReadinessPercent(),
  openRouterBridge: getServiceReadinessPercent(),
  sqlitePersistence: getServiceReadinessPercent(),
  serviceTransparency: getServiceReadinessPercent(),
  label: "Guarded",
  status: "guarded",
  note: "Production score is guarded until all production readiness checks are verified."
} as const;

