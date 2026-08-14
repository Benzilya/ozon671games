import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve("dist/client");
const nestedBase = join(root, "ozon671games");
const nestedNext = join(nestedBase, "_next");
const publicNext = join(root, "_next");

if (!existsSync(root)) {
  throw new Error("Static export directory dist/client does not exist.");
}

// vinext beta applies assetPrefix both to generated URLs and to the physical
// output directory. GitHub Pages already mounts this artifact at /ozon671games,
// so the physical prefix must be removed while the HTML URLs keep it.
if (existsSync(nestedNext)) {
  if (existsSync(publicNext)) {
    rmSync(publicNext, { recursive: true, force: true });
  }
  renameSync(nestedNext, publicNext);
  rmSync(nestedBase, { recursive: true, force: true });
  console.log("Moved ozon671games/_next -> _next for GitHub Pages.");
}

const cssDir = join(publicNext, "static", "css");
const chunksDir = join(publicNext, "static", "chunks");

if (!existsSync(join(root, "index.html"))) {
  throw new Error("Static export is missing index.html.");
}
if (!existsSync(cssDir) || readdirSync(cssDir).length === 0) {
  throw new Error("Static export is missing CSS assets under _next/static/css.");
}
if (!existsSync(chunksDir) || readdirSync(chunksDir).length === 0) {
  throw new Error("Static export is missing JavaScript chunks under _next/static/chunks.");
}

console.log("GitHub Pages asset layout verified.");
