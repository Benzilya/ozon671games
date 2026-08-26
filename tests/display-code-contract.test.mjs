import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const storyPath = new URL("../app/stories/tihiy-den/StoryClient.tsx", import.meta.url);
const shopPath = new URL("../app/shop/ShopClient.tsx", import.meta.url);

test("story and shop do not expose decorative TD-671 as canonical metadata", async () => {
  const [story, shop] = await Promise.all([
    readFile(storyPath, "utf8"),
    readFile(shopPath, "utf8"),
  ]);

  assert.equal(story.includes("TD-671"), false);
  assert.equal(shop.includes("TD-671"), false);
  assert.match(story, /quietDan\.code/);
  assert.match(shop, /products\[0\]\.code/);
});

test("shop keeps exact commercial values CMS-driven", async () => {
  const shop = await readFile(shopPath, "utf8");

  assert.match(shop, /Цена и тираж — из CMS/);
  assert.match(shop, /Тираж — из CMS/);
  assert.match(shop, /Цена — из CMS/);
  assert.doesNotMatch(shop, /\b\d[\d\s.,]*\s*₽/);
});
