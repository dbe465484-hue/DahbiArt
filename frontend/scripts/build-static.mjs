import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const toHide = [
  ["src/app/api", "src/app/_api_disabled"],
  ["src/app/admin", "src/app/_admin_disabled"],
];

function freeDevServerPorts() {
  if (process.platform !== "win32") return;
  try {
    execSync(
      'powershell -NoProfile -Command "foreach ($p in 3000,3001) { Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"',
      { stdio: "ignore" },
    );
  } catch {
    /* ignore */
  }
}

function hideDirs() {
  const moved = [];
  for (const [from, to] of toHide) {
    const fromPath = path.join(root, from);
    const toPath = path.join(root, to);
    if (!fs.existsSync(fromPath)) continue;
    if (fs.existsSync(toPath)) fs.rmSync(toPath, { recursive: true, force: true });
    fs.renameSync(fromPath, toPath);
    moved.push([fromPath, toPath]);
  }
  return moved;
}

function restoreDirs(moved) {
  for (const [fromPath, toPath] of moved) {
    try {
      if (fs.existsSync(toPath)) fs.renameSync(toPath, fromPath);
    } catch (err) {
      console.warn(`⚠ Impossible de restaurer ${path.basename(fromPath)}:`, err.message);
    }
  }
}

freeDevServerPorts();

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 300 });
}

const nextDir = path.join(root, ".next");
const outDir = path.join(root, "out");
rmDir(nextDir);
rmDir(outDir);

let moved = [];
try {
  moved = hideDirs();
  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "true" },
  });
  console.log("\n✓ Export statique → frontend/out/");
} catch (err) {
  console.error("\n✗ Build échoué. Arrêtez `npm run dev` puis relancez npm run build:netlify");
  throw err;
} finally {
  restoreDirs(moved);
}
