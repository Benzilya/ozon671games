import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist/client/_next/static");
const limits = {
  ".js": 900 * 1024,
  ".css": 300 * 1024,
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

const files = await walk(root);
let failed = false;

for (const [extension, limit] of Object.entries(limits)) {
  const matching = files.filter((file) => path.extname(file) === extension);
  let total = 0;
  for (const file of matching) total += (await stat(file)).size;
  const kb = (total / 1024).toFixed(1);
  const limitKb = (limit / 1024).toFixed(0);
  console.log(`${extension.slice(1).toUpperCase()} static budget: ${kb} KB / ${limitKb} KB`);
  if (total > limit) {
    console.error(`Bundle budget exceeded for ${extension}: ${kb} KB > ${limitKb} KB`);
    failed = true;
  }
}

if (failed) process.exit(1);
