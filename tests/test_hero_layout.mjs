// The hero graph places its notes by hand in docs/episode.json. A link that passes behind a note
// it does not connect reads as a false relation, so every link is checked against every other
// note's box. Pill widths are estimated generously from the label length.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { labelOf, linkPoints } from "../docs/hero.js";

const episode = JSON.parse(readFileSync(new URL("../docs/episode.json", import.meta.url), "utf8"));
const notes = new Map(episode.notes.map((note) => [note.title, note]));
// The decision pill is taller, because it carries its state as a second line.
const box = (note) => {
  const half = (Math.max(labelOf(note).length, note.title === episode.decision ? 26 : 0) * 11.5 + 40) / 2;
  const height = note.title === episode.decision ? 68 : 42;
  return { left: note.x - half, right: note.x + half, top: note.y - height / 2, bottom: note.y + height / 2 };
};

test("every link and phase state names a placed note", () => {
  for (const [a, b] of episode.links) assert.ok(notes.has(a) && notes.has(b), `${a} -> ${b}`);
  for (const phase of episode.phases) for (const title of Object.keys(phase.states)) assert.ok(notes.has(title), title);
  assert.ok(notes.has(episode.decision));
});

test("notes do not overlap and stay inside the picture", () => {
  const boxes = episode.notes.map((note) => ({ title: note.title, ...box(note) }));
  for (const b of boxes) assert.ok(b.left >= 0 && b.right <= 1000 && b.top >= 0 && b.bottom <= 515, `${b.title} outside`);
  for (const [i, a] of boxes.entries()) {
    for (const b of boxes.slice(i + 1)) {
      const overlap = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      assert.ok(!overlap, `${a.title} overlaps ${b.title}`);
    }
  }
});

test("no link passes behind a note it does not connect", () => {
  for (const [a, b] of episode.links) {
    for (const note of episode.notes) {
      if (note.title === a || note.title === b) continue;
      const r = box(note);
      const hit = linkPoints(notes.get(a), notes.get(b)).find((p) => p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom);
      assert.ok(!hit, `${a} -> ${b} passes behind ${note.title}`);
    }
  }
});
