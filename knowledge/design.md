# Design

The method page `docs/index.html` is one static page that a reader takes in within two minutes. It follows the seven-part structure of the DHCraft method sites in [brand-assets `web/design.md`](https://github.com/DigitalHumanitiesCraft/brand-assets/blob/main/web/design.md#page-structure-of-a-method-site), shared with Promptotyping and Grounded Vault. English stands in the HTML and reads without JavaScript. German comes from `PAGE_DE` in `docs/content.js` with `?lang=de`, and `tests/test_page_text.mjs` keeps both key sets equal. The Pages workflow publishes the page at <https://chpollin.github.io/second-brain-vault/> from the last state pushed to `main`, as [integration](integration.md#maintenance-and-distribution) describes.

## Parts

The Promptotyping start page is the reference for layout, type and look, following the owner's decisions of 2026-11-10 in brand-assets `web/design.md`.

| Part | Content |
|---|---|
| Title | Name and an abstract of two sentences, without a button row |
| Main figure | `docs/images/second-brain-figure.svg`, directly under the abstract, without heading or caption |
| Prose | Three short paragraphs that define the terms of the figure in sentences, with links inside the sentences, and name origin, manuscript and related methods |
| Reuse | Requirements sentence, a separate block of take-away controls (template as ZIP, skills, conventions, CLAUDE.md), then four numbered steps with copyable commands |
| Example | Seven prompts on the synthetic photo archive in `docs/example`, each visible and copyable with one line on what it yields |
| Limits, licence and citation | Three lines and one copyable citation |

The header carries brand, Reuse, Example and Specification, the language link, the GitHub icon and the theme toggle. The page opens light whatever the system setting, because `index.html` sets `data-theme="light"`, and the toggle switches to the shared dark values and stores the choice.

## Main figure

The figure is a hand-drawn SVG of 1600 by 700 units, in English as `docs/images/second-brain-figure.svg` and in German as `second-brain-figure-de.svg`, which the German page loads with Sora and Instrument Sans embedded as data URIs, so it keeps its type inside `<img>`, in a paper and on a slide. Both are exported as PNG at double resolution through headless Edge. Each block carries a title and one line, the columns carry their names only, and every label stays legible at 800 pixels width. File names stand in the prose below the figure. The third step of the session is called curate, because writing back names only the mechanical part. It stands on a light plate in both schemes. On phones it keeps a legible width and scrolls sideways inside its frame.

The vault, the agent session and the project repository take three balanced columns. Knowledge, rules and state fill the vault without empty space, and the repository mirrors knowledge and rules and adds code and data. The colours follow the mark and the roles the Research Mission Control infographic already assigned: blue for reading and writing files, purple for work, decisions and acceptance, which also marks state as the place of the operator's open questions, green for knowledge and orange for rules in both vault and repository. Every colour carries a text label and an icon. Green and orange come close for protanopia, and purple and blue for both red-green deficiencies; the labels, icons and the different shapes (bars, boxes, arrows) carry the distinction. Orange reaches 2.3:1 on paper and serves only as a supplementary bar.

The content rests on [Convention Knowledge Documents](../Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md), the Repo Directory and the skill `vault-orient`. A session in a project repository reads the vault without writing to it and hands a finding over, which a vault session enters once accepted.

## Example

The demo runs in a clone of the template on the invented sources in `docs/example/Sources`, and the finished notes in `docs/example` are its reference. Its prompts follow the arc of the operator's build sequence of 2026-11-04 on synthetic material: orient, bring in sources, agree the structure, build it, write notes, decide with reasons, accept and reuse.

On 2026-11-10 the seven prompts were run on a fresh clone in a temporary folder outside the repository, with the session itself acting as agent. Step 2 reported eight hard findings, the tags `source` and `data-management` unregistered in each source, and the four sources unreachable from HOME. Step 4 produced the overview page, two Project Overviews, their ACTIVE-WORK entries and the two tags, the check ended with `hard: 0` and `measured: 0`, and the commit passed the hook. Step 5 produced Archival Master, Access Copy and File Format, and the check listed each with fewer than three sources as a measured finding. Step 6 yielded a TIFF proposal whose claim on long-term readability the vault does not support, which the prompt now asks the agent to mark. Step 7 filed the decision and showed that its conditions cover still images, so the audio question needs its own decision. Three prompts were improved on this run: step 4 asks for reachability instead of linking every source from HOME, step 6 asks to mark unsupported grounds, and step 7 first accepts and files the decision, which the earlier sequence never did. The conversational steps 1, 3 and 6 depend on the agent's answer and were judged by their result only.

The example domain is a team's research data work. A photo archive project decides on the format of its archival masters, and an oral history project later checks whether the decision transfers to audio. Its literature notes carry bibliographic entries only.

## Knowledge explorer

The operator rejected the first list/graph/full-text workspace as too text-heavy on 2026-11-08. The next slice at `docs/explorer.html` answers one question: why are photo masters TIFF, how does JPEG derive from them, and where does this decision stop applying? The previous generic note browser remains at `docs/notes.html` as a secondary destination. The method page links the decision view once, from step 6 of the example.

The initial view contains three compact grounds feeding the TIFF master, a directed derivation to the JPEG access copy, and the boundary between photographs and audio. The rejected JPEG-only alternative remains selectable. These are editorially curated relationships justified by the example decision and its named sources, not relation types inferred from graph topology. One selected object reveals its exact original passage and source line immediately beneath that object. Selecting another object moves the single evidence passage; Escape closes it. Native buttons provide pointer and keyboard access. Selection is addressable and follows browser history.

The wide composition is a spatial argument, with reasons left, master centre, derived copy right, and scope below. Narrow screens preserve direction through a vertical flow and reflow the evidence at its selected object. Source passages remain English and are identified as originals. German labels are editorial condensations. The existing DHCraft type and colour tokens apply. No search, filters, full note column or repeated evidence inventory appears in this slice. Synthetic data and source provenance remain explicit.

Acceptance tasks are to explain the TIFF grounds, identify JPEG as a regenerable access copy, and recognise that the image decision leaves audio open. The visual arrangement must communicate these before opening full documents. Evidence selection must stay at the selected object without blocking the composition. Human acceptance remains open until the operator examines the result.

## Visual system

The page uses the shared DHCraft web foundation, copied unchanged to `docs/assets/dhcraft/` with its licence file (tokens, building blocks, copy script, watercolour mark, fonts). Its design document and specimen page are not copied, because the site serves only what the page loads. Header, footer, buttons, code blocks with copy buttons, the skip link and a small set of line icons (download, external link, terminal, prompt) follow the Promptotyping start page. `docs/site.css` maps the short role names used by the page and the explorer pages onto the `--dh-*` roles. Parts are separated by a hairline, and borders are drawn only for controls, the take-away block, the figure plate and the code blocks.

## Terms

| English | German |
|---|---|
| vault | Vault |
| overview page, map of content | Übersichtsseite, Map of Content |
| AI agent, agent | KI-Agent, Agent |
| control document | Steuerdokument |
| procedure (skill) | Ablauf (Skill) |
| vault governance | Vault-Governance |
| outdated copy (restatement) | veraltete Kopie |
| source converted to Markdown | in Markdown umgewandelte Quelle |

## Data and publication boundary

The site serves the template files and the synthetic example only. `scripts/build_site.py` excludes `knowledge/`, and `tests/test_site_privacy.py` fails when served files contain a `knowledge/` path, a local home path, the names of the owner's private working repositories or an email address in the example data. Statements about tools, costs and data handling follow the providers' pages linked in `docs/content.js`, read on 2026-11-04.

## Evidence

On 2026-11-10, in the third round, full-page captures through headless Edge covered 1280 and 360 pixels, light, a dark system setting (the page stayed light), dark through the toggle, German, and JavaScript switched off. None showed horizontal document overflow, the figure loaded in all states, and without JavaScript the English page is complete while copy buttons, language link and toggle are absent. Static page text outside code blocks is about 565 English words. Actual 200 percent zoom, a screen reader and copying to the clipboard were not exercised.

On 2026-11-10, after the second round, the page was inspected at 1280 by 800 and 360 by 740 CSS pixels, light and dark, English and German, and with JavaScript switched off, through full-page captures and the built-in browser. No width showed horizontal document overflow. Without JavaScript the English page is complete, the copy buttons and the language link are absent. Actual 200 percent zoom, a screen reader and copying to the clipboard were not exercised. The static page text outside code blocks fell from 1094 to about 590 English words between the first and second round.

On 2026-11-10 the rebuilt page was inspected in the built-in browser at 1280 by 800 and 360 by 740 CSS pixels, light and dark, in English and German: entry, example, diagram, template contents, start, limits and footer. No horizontal document overflow at 360 pixels. Keyboard: a stepper button changed the phase with Enter and showed its focus ring, a note button in the card opened the reading panel with Enter, and Escape closed it and returned focus. The explorer and notes pages were seen at 1280 by 800 with the shared header. The page without JavaScript was checked only in source, where English, the static phase list and every link are present and the language switch stays hidden. Actual 200 percent zoom, a screen reader and copying to the clipboard were not exercised. An independent fresh-context review from source found an inaccurate check sentence, a removal advice that would break the checks, an incomplete copy list in step 5, an unqualified licence line, colour names in the legend that no longer matched, bold label prefixes, a simile and colons joining clauses. These were corrected. Its remaining points are listed under open questions in the journal.

The focused decision view was visually inspected at 1600 by 900, 1280 by 800 and 360 by 740 CSS pixels on 2026-11-08. Selected Information, Scanner, Master, Format and Audio states were inspected, with no horizontal document overflow in the checked widths. Pointer selection and keyboard Enter opened evidence at the selected object. Escape from the evidence source link closed it and restored object focus. Independent source and wide-view review found an Escape defect and a loading race, both corrected. The parent rechecked Escape and narrow reflow. Existing Python and Node checks passed. Actual 200 percent browser zoom and human acceptance remain open.

Five reader tests on 2026-11-04 used separate subagents in the role of a professional without Obsidian, Git or agent experience, given screenshots and the page text. They are model readers, not people.

- All readings understood the example and the principle of one place per statement, and the last one retold the seven phases correctly and called the page calm.
- The first three would have stopped at the first build step, skipped the reference as jargon and asked about their data. The page answered with an audience line, the tool line, the data sentences and the folded reference.
- The fourth missed the assistant's setup, Docling's installation and found the legend and the abbreviation MOC confusing. The first step now connects the assistant, the legend has one entry for the system frame, and overview pages are labelled by their field.
- The fifth asked when Git and Python are needed, where the skills come from, and found the reference to Luhmann and the phase name "test in the tool" unclear. These texts were changed.

Still open from these readings is how a team shares a vault. Price and setup time stay out of the page, which names the paid plan and links the provider. Persona and parallel review agents each have one line in the reference. A human reading and the operator's acceptance remain open.

A second round on 2026-11-04 compared the former hero, a whole-vault graph with numbered steps, with three variants in a temporary lab: a focus graph of hand-placed notes, a decision note that grows step by step, and lanes for you, the assistant and the notes. All three shared a stepper with named phases and actors. Three model readers in the roles of project lead, librarian and researcher ranked the growing note first, then the focus graph, the former hero and the lanes. An independent model UI reviewer recommended combining the focus graph with the note card, so that the graph shows where the reasoning lives and the card what it says, and replacing the graph by a list of notes on phones. Their defects (colliding phone labels, an unreadable scaled graph, moving controls, empty reason headings, a link behind an unrelated note, an eyebrow line) shaped the current hero.

A fresh model reviewer then read the built hero in three reader roles and against the interface yardstick. Its findings led to a visible focus ring on highlighted notes, the stepper first in document order, a decision step that shows acceptance as the person's act, a legend that matches the drawn states, a reuse state that reads as differing conditions, the decision state inside its pill, a German rendering of the example note, scroll shadows on the card and smaller type on short wide screens such as a projector. Still open from that reading are the phone card moving with the length of the note list during play, and the generic caption of the test phase.

## Decisions

- 2026-11-04: the method page replaced the structure explorer and the work and knowledge demo as the public site. The demo, its tooling and its contract were deleted.
- 2026-11-04: of three layout variants (guided story, workspace, build along) the operator chose build along. The rejected variants were removed.
- 2026-11-04: after operator review the separate sections on what a vault is, the example, data and maintenance were merged into the hero and one section of notes, and the reference became a single file tree, because the earlier page said the same things twice and stacked too many levels.
- 2026-11-04: recorded agent sessions were dropped from the site because they ran under the owner's personal configuration. New recordings require a neutral configuration.
- 2026-11-04: on the operator's instruction the combined focus graph and note card replaced the whole-vault hero graph. The episode staging of the graph module, the old stepper and the lab variants were removed.
- 2026-11-08: the operator commissioned a knowledge explorer using the example data alongside the method page, with contextual reading and inspectable link evidence as the first design criteria. Source repositories and the local `vault-graph` clone are retained while the integration is examined.
- 2026-11-10: following the source owner's terminology decision of that day, the page calls the LLM-driven program an agent (KI-Agent) instead of an assistant. Three statements were narrowed to what the template supports. Git keeps the committed states, parallel checking agents leave the decision on their findings to the reader, and the footer names passing checks and synthetic trials instead of general readiness. After an independent fresh-context review, step 5 has the agent copy the template's rules, checks and skills, give converted sources the required frontmatter and set up Git, because later steps and the reference depend on them. The tool line names Python for Docling as well.
- 2026-11-10: on the operator's commission for compact, reusable method pages in one corporate design, the page was rebuilt around the reader's first decision. New sections show the three layers, the connection of vault and project repositories, the template contents, the start routes, the limits and the citation. The growing build graph and its module `docs/graph.js`, the folded reference, the night grounds and the local font copies were removed, and the shared DHCraft foundation replaced the page's own token layer. The example, the seven agent steps and the explorer pages remain. English moved into the HTML so that the page reads without JavaScript.
- 2026-11-10, second round: on the owner's feedback that the page was still too text-heavy and too structured, it became one static page in the seven-part structure of the DHCraft method sites. The playable example with its stepper, focus graph, note card and reading panel (`docs/hero.js`, `docs/panel.js`, `docs/episode.json`, `scripts/build_graph.py` and its test) was removed, and its arc moved into a prompt demo on the synthetic sources. The template contents section and the section navigation were dropped, because the figure and the terms carry the layers and the README carries the file lists. The decision view and the note browser remain as one link.
- 2026-11-10, third round: after the owner's review the Promptotyping start page became the reference. The page opens light with a dark toggle, the main figure is a standalone SVG directly under the abstract, the terms became running prose, take-away files stand in their own block, and the button row beside the abstract is gone. The colours of the mark were assigned as recorded under Main figure. `docs/data.json` and `scripts/build_site.py` stay although no page reads the data any more, because the commit check depends on them; whether they go is the owner's decision.
