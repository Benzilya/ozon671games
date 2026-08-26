import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const readSource = (path) => readFileSync(resolve(path), "utf8");

test("root layout keeps the living archive atmosphere mounted", () => {
  const layout = readSource("app/layout.tsx");
  assert.match(layout, /SiteAtmosphere/);
  assert.match(layout, /archive-experience\.css/);
  assert.match(layout, /inner-archive\.css/);
  assert.match(layout, /<SiteAtmosphere\s*\/>/);
});

test("site atmosphere remains backed by the procedural NIGHT SIGNAL", () => {
  const wrapper = readSource("app/components/SiteAtmosphere.tsx");
  const soundscape = readSource("app/components/NoirSoundscape.tsx");
  assert.match(wrapper, /NoirSoundscape/);
  assert.match(soundscape, /NIGHT SIGNAL/);
  assert.match(soundscape, /AudioContext/);
  assert.match(soundscape, /aria-pressed/);
  assert.match(soundscape, /Громкость атмосферы/);
});

test("archive continuity CSS preserves readable atmosphere controls and mobile dock clearance", () => {
  const css = readSource("app/archive-experience.css");
  assert.match(css, /\.noir-sound/);
  assert.match(css, /font-size:9px/);
  assert.match(css, /bottom:70px/);
  assert.match(css, /archive-index:before/);
});

test("public inner pages stay inside the living archive visual system", () => {
  const css = readSource("app/inner-archive.css");
  assert.match(css, /671 \/ ACTIVE ARCHIVE/);
  assert.match(css, /INDEX \/ FILTERS/);
  assert.match(css, /ACTIVE FILE/);
  assert.match(css, /\.catalog-page/);
  assert.match(css, /\.films-page/);
  assert.match(css, /\.characters-page/);
  assert.match(css, /\.universe-page/);
  assert.doesNotMatch(css, /\.admin-page/);
  assert.doesNotMatch(css, /\.account-page/);
});
