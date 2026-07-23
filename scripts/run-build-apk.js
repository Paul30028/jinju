/**
 * npm run apk — spawn build-apk.bat and keep console attached
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bat = path.join(root, "build-apk.bat");

const child = spawn("cmd.exe", ["/d", "/c", bat], {
  cwd: root,
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code) => process.exit(code ?? 1));
