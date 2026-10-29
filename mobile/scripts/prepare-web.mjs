import { access, copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const mobileDir = resolve(scriptDir, "..");
const repoRoot = resolve(mobileDir, "..");
const webDir = join(mobileDir, "www");
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "config.js",
  "manifest.webmanifest",
  ".nojekyll",
  "icons/mas-crm.svg"
];

for (const file of files) {
  await access(join(repoRoot, file));
}

await rm(webDir, { recursive: true, force: true });
for (const file of files) {
  const source = join(repoRoot, file);
  const destination = join(webDir, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

console.log(`Frontend do CRM sincronizado para ${webDir} (${files.length} arquivos).`);
