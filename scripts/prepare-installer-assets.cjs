const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const installerDir = path.join(root, "build", "installer");
const sourceDir = path.join(installerDir, "source");
const officialIcon = path.join(root, "assets", "icons", "icon.ico");

if (!fs.existsSync(officialIcon)) throw new Error("Official icon missing: assets/icons/icon.ico");
fs.mkdirSync(sourceDir, { recursive: true });
for (const name of ["icon.ico", "uninstaller.ico", "header-icon.ico"]) {
  fs.copyFileSync(officialIcon, path.join(installerDir, name));
}

const manifest = {
  product: "Knoux AI Clipboard Pro",
  strategy: "electron-builder NSIS branding",
  icon: "build/installer/icon.ico",
  uninstallerIcon: "build/installer/uninstaller.ico",
  headerIcon: "build/installer/header-icon.ico",
  wizardHeaderImage: "Planned",
  wizardSidebarImage: "Planned",
  fullCustomInstallerUi: "Planned",
  generatedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(installerDir, "asset-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("KNOUX installer icon assets prepared. Wizard bitmap visuals remain guarded until verified source assets are committed.");
