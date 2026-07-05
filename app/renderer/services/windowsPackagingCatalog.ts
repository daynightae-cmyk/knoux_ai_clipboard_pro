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

export const WINDOWS_PACKAGING_SERVICES: ProductionService[] = [
  svc("windows-installer-branding", "Windows Installer Branding", "Ready", "electron-builder NSIS", "Standard NSIS branding is configured after the green build gate.", "Use default NSIS visuals until installer artifacts are generated.", "package.json build.nsis"),
  svc("installer-icon", "Installer Icon", "Ready", "assets/icons/icon.ico", "Installer icon is prepared from the official KNOUX product icon.", "Use the existing official application icon.", "scripts/prepare-installer-assets.ps1"),
  svc("installer-header-icon", "Installer Header Icon", "Ready", "assets/icons/icon.ico", "Header icon is prepared from the official KNOUX product icon.", "Use the existing official application icon.", "scripts/prepare-installer-assets.ps1"),
  svc("wizard-header-image", "Wizard Header Image", "Planned", "build/installer/wizard-header.bmp", "Premium NSIS header artwork is planned until local BMP generation is verified.", "Use installerHeaderIcon and default NSIS header area.", "asset-boundary", false),
  svc("wizard-sidebar-image", "Wizard Sidebar Image", "Planned", "build/installer/wizard-sidebar.bmp", "Premium NSIS sidebar artwork is planned until local BMP generation is verified.", "Use default NSIS sidebar.", "asset-boundary", false),
  svc("install-directory-selection", "Install Directory Selection", "Ready", "nsis.allowToChangeInstallationDirectory", "The NSIS wizard allows install directory selection.", "Default install directory remains available.", "package.json build.nsis"),
  svc("desktop-shortcut", "Desktop Shortcut", "Ready", "nsis.createDesktopShortcut", "Desktop shortcut creation is configured through electron-builder NSIS.", "Create a shortcut manually if OS policy blocks it.", "package.json build.nsis"),
  svc("start-menu-shortcut", "Start Menu Shortcut", "Ready", "nsis.createStartMenuShortcut", "Start Menu shortcut creation is configured through electron-builder NSIS.", "Launch from installation directory if shortcuts are blocked.", "package.json build.nsis"),
  svc("launch-after-install", "Launch After Install", "Ready", "nsis.runAfterFinish", "Launch after install is enabled where supported.", "Launch manually from the shortcut after setup.", "package.json build.nsis"),
  svc("start-with-windows", "Start With Windows", "Planned", "native auto-start integration", "Start with Windows remains planned until real auto-launch is verified.", "Launch manually.", "future-native-startup", false),
];
