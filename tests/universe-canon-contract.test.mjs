import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const universePath = new URL("../app/universe/UniverseClient.tsx", import.meta.url);

async function source() {
  return readFile(universePath, "utf8");
}

test("universe map is driven by the central stories dataset", async () => {
  const text = await source();

  assert.match(text, /import \{ quietDan, stories, type StoryRecord \} from "\.\.\/data\/stories";/);
  assert.match(text, /const works: WorkNode\[\] = stories\.map/);
  assert.match(text, /Подтверждённых связей пока нет/);
});

test("universe map does not publish invented cross-story evidence", async () => {
  const text = await source();
  const forbiddenClaims = [
    "Одна ночная смена",
    "Последний маршрут",
    "Повторяющийся сигнал",
    "Канал 6Б",
    "Предмет из Ёжлесово",
    "Доставка в квартиру 101",
    "Красный автомобиль",
    "confidence:",
    "evidence:",
  ];

  for (const claim of forbiddenClaims) {
    assert.equal(text.includes(claim), false, `Universe UI must not contain unverified claim: ${claim}`);
  }
});
