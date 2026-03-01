import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const outDir = resolve(rootDir, "out");

mkdirSync(outDir, { recursive: true });
cpSync(resolve(rootDir, "src", "manifest.json"), resolve(outDir, "manifest.json"));
cpSync(resolve(rootDir, "src", "assets"), resolve(outDir, "assets"), { recursive: true });
