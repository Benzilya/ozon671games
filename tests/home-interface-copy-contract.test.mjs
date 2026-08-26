import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homePath = new URL("../app/HomeClient.tsx", import.meta.url);

test("homepage atmospheric copy is explicitly labeled as non-canonical", async () => {
  const text = await readFile(homePath, "utf8");

  assert.match(text, /INTERFACE COPY \/ НЕ ЦИТАТА ИЗ ПРОИЗВЕДЕНИЯ/);
  assert.match(text, /Некоторые истории начинаются с выстрела\. Эта — со швабры\./);
});
