import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(path), "utf8");

const publicUiFiles = [
  "app/HomeClient.tsx",
  "app/films/FilmsClient.tsx",
  "app/timeline/TimelineClient.tsx",
  "app/community/CommunityClient.tsx",
  "app/characters/CharactersClient.tsx",
  "app/stories/tihiy-den/StoryClient.tsx",
];

test("public archive surfaces use precise statuses instead of generic WIP labels", () => {
  for (const path of publicUiFiles) {
    const source = read(path);
    assert.doesNotMatch(source, /WORK IN PROGRESS|\bWIP\b/, `${path} contains a public WIP label`);
  }
});

test("honest data-state labels remain explicit", () => {
  assert.match(read("app/stories/tihiy-den/StoryClient.tsx"), /LOCATION \/ PENDING/);
  assert.match(read("app/community/CommunityClient.tsx"), /ОЖИДАЕТ ДАННЫХ ИЗ CMS/);
  assert.match(read("app/HomeClient.tsx"), /REC \/ DEMO/);
});
