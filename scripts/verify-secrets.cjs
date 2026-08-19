const { execFileSync } = require("child_process");

const productionPaths = ["app/backend", "app/renderer", "app/shared", "api", "main.js", "preload.js", "package.json"];
const rawOutput = execFileSync("git", ["grep", "-nEI", "(sk-or-v1-[A-Za-z0-9_-]{24,}|sk-[A-Za-z0-9_-]{32,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)", "--", ...productionPaths], { encoding: "utf8" }).trim();
const output = rawOutput
  .split("\n")
  .filter((line) => !line.includes("EXAMPLE_DO_NOT_USE"))
  .join("\n");
const trackedDotenv = execFileSync("git", ["ls-files", ".env", ".env.local", ".env.production", ".env.development"], { encoding: "utf8" }).trim();

if (trackedDotenv) {
  console.error(`Tracked dotenv file(s) are forbidden:\n${trackedDotenv}`);
  process.exit(1);
}
if (output) {
  console.error(`Potential production secret material found:\n${output}`);
  process.exit(1);
}
console.log("Secret scan passed: no tracked dotenv files or credential signatures in production sources.");
