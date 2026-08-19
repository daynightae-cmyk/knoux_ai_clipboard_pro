const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const electron = process.platform === "win32"
  ? path.join(root, "node_modules", ".bin", "electron.cmd")
  : path.join(root, "node_modules", ".bin", "electron");

function requireFile(relativePath) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) throw new Error(`Missing smoke-test artifact: ${relativePath}`);
}

const version = execFileSync(electron, ["--version"], {
  cwd: root,
  encoding: "utf8",
  shell: process.platform === "win32",
}).trim();
const major = Number((version.match(/v(\d+)/) || [])[1]);
if (!Number.isFinite(major) || major < 41) throw new Error(`Unsupported Electron runtime: ${version}`);

for (const file of ["main.js", "preload.js", "dist/index.html", "build/app/backend/init.js"]) requireFile(file);
const preload = fs.readFileSync(path.join(root, "preload.js"), "utf8");
for (const required of ["contextBridge.exposeInMainWorld", "ai:run", "ai:status", "system:ipc-integrity"]) {
  if (!preload.includes(required)) throw new Error(`Preload smoke check failed: ${required}`);
}

console.log(`Electron smoke passed: ${version}; main, preload, renderer, and compiled backend artifacts are present.`);
