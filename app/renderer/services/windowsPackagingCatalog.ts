import { ProductionService, ServiceStatus } from "./productionCatalog";

const svc = (id: string, displayName: string, status: ServiceStatus, dependency: string, description: string, fallback: string, actionHandler: string, implemented = true): ProductionService => ({
  id,
  displayName,
  title: displayName,
  category: "Packaging",
  status,
  runtimeType: "windows-installer",
  tier: status === "Planned" || status === "Missing" || status === "Disabled" ? "planned" : status === "Guarded" ? "guarded" : "live",
  dependency,
  implemented,
  requiresConfig: false,
  userFallback: fallback,
  fallback,
  actionHandler,
  description,
  channel: actionHandler,
});

export const WINDOWS_PACKAGING_SERVICES: ProductionService[] = [];
