// The English method page stands in docs/index.html, the German text in PAGE_DE of
// docs/content.js. Both must cover the same keys, so neither language loses a statement.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

globalThis.location = { search: "" };
const { HTML_KEYS, PAGE_DE } = await import("../docs/content.js");
const html = readFileSync(new URL("../docs/index.html", import.meta.url), "utf8");

const pageKeys = new Set([...html.matchAll(/data-t(?:-label|-alt)?="([^"]+)"/g)].map((match) => match[1]));

test("every marked element has a German entry", () => {
  assert.deepEqual([...pageKeys].filter((key) => !(key in PAGE_DE)), []);
});

test("every German entry belongs to a marked element", () => {
  assert.deepEqual(Object.keys(PAGE_DE).filter((key) => !pageKeys.has(key)), []);
});

test("markup is allowed only for declared keys", () => {
  const marked = Object.entries(PAGE_DE).filter(([key, value]) => /<[a-z]/i.test(value) && !HTML_KEYS.has(key));
  assert.deepEqual(marked, []);
});

test("no middle dot as separator in page text", () => {
  assert.equal(html.includes("·"), false);
  assert.equal(Object.values(PAGE_DE).some((value) => value.includes("·")), false);
});
