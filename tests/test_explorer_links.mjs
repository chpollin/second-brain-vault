import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Import the browser module without imposing a package type on this no-build repository.
const source = await readFile(new URL("../docs/markdown.js", import.meta.url), "utf8");
const { markdownLink, renderMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const ctx = (file) => ({
  file,
  resolve: () => "",
  href: (path, heading) => "#" + new URLSearchParams({ file: path, heading }).toString(),
});

test("relative document links resolve from the displayed document", () => {
  const root = markdownLink("knowledge/INDEX.md", ctx("README.md"));
  assert.equal(new URLSearchParams(root.href.slice(1)).get("file"), "knowledge/INDEX.md");
  const sibling = markdownLink("project.md", ctx("knowledge/INDEX.md"));
  assert.equal(new URLSearchParams(sibling.href.slice(1)).get("file"), "knowledge/project.md");
  const parent = markdownLink("../README.md#start-smaller", ctx("knowledge/specification.md"));
  assert.equal(parent.href, ctx("").href("README.md", "start-smaller"));
  const spaced = markdownLink("../Vault%20Operations/Templates/Template%20Research%20Persona.md", ctx("knowledge/integration.md"));
  assert.equal(new URLSearchParams(spaced.href.slice(1)).get("file"), "Vault Operations/Templates/Template Research Persona.md");
});

test("local headings and footnotes retain the displayed file route", () => {
  const context = ctx("Vault Operations/Conventions/Convention Skills.md");
  assert.equal(markdownLink("#testing", context).href, context.href(context.file, "testing"));
  const html = renderMarkdown("Source[^bp]\n\n[^bp]: Reference", context);
  assert.ok(html.includes(context.href(context.file, "fn-bp").replaceAll("&", "&amp;")));
  assert.ok(html.includes('id="fn-bp"'));
  assert.ok(!html.includes('href="#fn-'));
});

test("only HTTP external links become anchors and text stays escaped", () => {
  const context = ctx("README.md");
  for (const target of ["javascript:alert", "data:text/html,test", "file:///secret", "//elsewhere.test/x", "\\\\elsewhere.test\\x"]) {
    assert.equal(markdownLink(target, context), null);
  }
  const html = renderMarkdown('[<unsafe>](https://example.org/?q="quoted"&a=1) and `<script>`', context);
  assert.ok(html.includes("&lt;unsafe&gt;"));
  assert.ok(html.includes("&amp;a=1"));
  assert.ok(!html.includes('<unsafe>'));
  assert.ok(!html.includes('<script>'));
  assert.equal((html.match(/<a /g) || []).length, 1);
  assert.ok(renderMarkdown('[`Project`](knowledge/project.md)', context).includes("<code>Project</code></a>"));
});
