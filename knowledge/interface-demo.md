# Public work and knowledge interface

The [interface demo](https://chpollin.github.io/second-brain-vault/demo/) presents the template through the Second Brain work interface. The [structure explorer](https://chpollin.github.io/second-brain-vault/) remains the entry to the template's instructions and prescribed reading sequences. Both use the public template. The personal research vault remains outside the published data.

## Research purpose and design

The [research workflow](research-workflow.md) requires a researcher to recover relevant knowledge, inspect a contribution and preserve the grounds of a response. These requirements determine the demo's tasks. They are criteria for evaluating the interface. They do not establish a measured improvement in research.

| Research task | Interface choice | Observable acceptance criterion |
|---|---|---|
| Recover a project's present question | Existing project circle and adjacent work detail | The question and its context can be recovered without changing the source wording |
| Inspect documented contributions | A flat list with a selected evidence detail | Responsibility and recorded part membership are distinguishable from an agent's live activity |
| Explore familiar knowledge and follow a new connection | Expandable HOME entry points and a selected document's incoming and outgoing links | The researcher can follow an actual link, inspect its literal source line and return to the prior selection |
| Check what kind of knowledge a document contains | Document type, maturity, tags and aliases in the knowledge sheet | These independent properties retain their original values and remain distinct from project status |
| Give a reasoned response | The shared question editor and passage-review workspace | The response remains bound to its source revision and is recoverable through the browser's saved state or export |

The map begins with existing navigation hubs. It does not infer conceptual clusters from visual proximity. A Wikilink establishes a navigable reference. It does not establish support, contradiction or causal dependency. Incoming and outgoing lists preserve direction, and the reference detail carries the original line and target anchor. An unresolved reference remains an explicit finding.

The original project circles, system font and existing color tokens preserve continuity with the working interface. Blue marks questions, turquoise marks documented steps and apricot marks external contributions. Text and symbol labels preserve meaning without color. The collective view uses compact rows and one evidence area, while the knowledge view lets the source reader use the available width. Native disclosure controls retain full wording without requiring all text to occupy the initial view. These choices reduce repeated material and nested panels. A real research task must still test whether retrieval and interpretation improve.

The public template intentionally retains its Example Project and placeholder source wording. It demonstrates the interface contract without substituting fictional completed agent runs or private project content. The AI-Team, AI-Organisation, AI-Civilisation and AI-Colony lenses retain their experimental role. A documented work item does not establish that an agent is currently working.

## Source and publication contract

`demo/core/` contains the reviewed generic frontend source. `scripts/sync_demo_core.py --ui-source <checkout>` refreshes a named allowlist and removes personal project mappings, reviewed private reading aids, project-specific acceptance shortcuts and local inbox submission. It aborts when a named adaptation boundary changes. `demo/upstream.json` records the upstream code revision and per-file source hashes. Changes to those boundaries require code review before another transfer.

`python scripts/build_demo.py` generates `docs/demo/` from tracked, visible Markdown files in this template. Local profiles, hidden files, seeded defect fixtures, the generated site and the demo source directory are excluded. Source records preserve the entire normalized Markdown, content revision and public repository address. The shared graph parser resolves full relative paths and retains quoted Wikilink occurrences. The work adapter maps this template's English inline fields to the interface contract, preserving the original question, context and source line. It fails on ambiguous project references or if no declared project is parsed. An obsolete or unreviewed file in the output directory also blocks the build, so it cannot survive into a later publication. The generated demo entry selects the first actual template project.

The static runtime loads `demo-data.json` and answers the reader's source, catalog and graph requests from that snapshot. It makes no local API requests. A failed snapshot load produces a visible reload action. The catalog searches either the complete public text or filenames and headings. A project filter uses the directory of its mapped project note. Public answer storage has a separate browser key namespace. Saving an answer confirms browser storage only. The interface offers export and reports no inbox transfer, repository adoption, agent activity or technical completion.

The template's current `Decision` question maps to the existing `Entscheidung` response contract and the decision glyph. Its English type and original source line remain recorded. Additional point kinds require an explicit response contract before entering this demo. An unsupported kind blocks generation, which prevents it from silently becoming an artifact acceptance question.

The existing Pages workflow builds the explorer and demo, checks them and deploys their artifact. Generated data remains ignored by Git. Distribution still follows the [maintenance and public snapshot procedure](integration.md#maintenance-and-distribution), so private maintenance history cannot become part of the public repository.

## Verification and operator acceptance

`tests/test_build_demo.py` checks deterministic generation, complete source text, exact reference lines, public input boundaries and the absence of private overlays or write requests in the distributed core. `tests/test_demo_runtime.mjs` checks static routes, exact source retrieval, catalog scope and rejection of unavailable actions. The Pages workflow also runs the template's structural checks, Python tests, Ruff checks and JavaScript syntax checks.

Browser verification must inspect the work, collective and knowledge routes, document opening, question storage, source passage review, keyboard navigation, a narrow viewport and enlarged text. It must also check failed requests and browser errors. Operator acceptance and scholarly evaluation remain separate from these technical checks. A useful comparison asks whether a researcher finds the required source, interprets the relationship correctly and produces a response whose justification remains recoverable. The source material and task should be held constant across interface variants.
