const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
let failures = 0;

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

function requireFile(relativePath) {
  if (fs.existsSync(path.join(root, relativePath))) pass(`required file: ${relativePath}`);
  else fail(`missing required file: ${relativePath}`);
}

function run(label, args) {
  try {
    execFileSync(npmCommand, args, { cwd: root, stdio: "inherit" });
    pass(label);
  } catch {
    fail(label);
  }
}

console.log("KNOUX Production Doctor — executable release gate");
for (const file of [
  "package.json",
  "package-lock.json",
  "main.js",
  "preload.js",
  "eslint.config.mjs",
  "app/backend/ipc/canonical-ipc.js",
  "app/backend/ipc/unified-service-ipc.js",
  "app/renderer/services/productionCatalog.ts",
  "app/renderer/services/serviceOperations.ts",
  "api/ai/[action].js",
  ".nvmrc",
]) requireFile(file);

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const expectedNode = fs.readFileSync(path.join(root, ".nvmrc"), "utf8").trim();
if (!pkg.main || pkg.main !== "main.js") fail("package main must be main.js");
else pass("package main is main.js");

for (const script of ["lint", "test", "build", "dist:installer", "secret:scan", "audit:production"]) {
  if (pkg.scripts?.[script]) pass(`required npm script: ${script}`);
  else fail(`missing npm script: ${script}`);
}

const electronVersion = String(pkg.devDependencies?.electron || "").replace(/^[^0-9]*/, "");
if (Number(electronVersion.split(".")[0]) >= 41) pass(`supported Electron baseline: ${electronVersion}`);
else fail(`Electron must be a currently supported major; found ${electronVersion || "missing"}`);

if (process.versions.node.startsWith(`${expectedNode}.`)) pass(`Node matches .nvmrc (${expectedNode})`);
else fail(`Node ${process.versions.node} does not match .nvmrc ${expectedNode}`);

const trackedSecrets = execFileSync("git", ["ls-files", ".env", ".env.local", ".env.production", ".env.development"], { cwd: root, encoding: "utf8" }).trim();
if (trackedSecrets) fail(`tracked secret file(s): ${trackedSecrets}`);
else pass("no tracked dotenv files");

const mainSource = fs.readFileSync(path.join(root, "main.js"), "utf8");
if (/registerCanonicalIPC/.test(mainSource) && !/ipcMain\.handle/.test(mainSource)) pass("IPC registration is centralized outside createWindow");
else fail("main process IPC registration is not canonical");

const catalogSource = fs.readFileSync(path.join(root, "app/renderer/services/productionCatalog.ts"), "utf8");
if (/hasVerifiedServiceRunner/.test(catalogSource) && /VERIFIED_LIVE_SERVICE_IDS/.test(catalogSource)) pass("catalog state is tied to verified runners");
else fail("catalog does not enforce verified service runners");

run("secret scan", ["run", "secret:scan"]);
run("dependency audit (production, high)", ["run", "audit:production"]);
run("lint", ["run", "lint"]);
run("unit and integration tests", ["test"]);
run("renderer and Electron TypeScript build", ["run", "build"]);

if (failures > 0) {
  console.error(`Production Doctor failed with ${failures} gate(s) failing.`);
  process.exit(1);
}
console.log("Production Doctor passed.");
