# Design

The method page in `docs/` lets a reader decide from its entry, in one or two steps, whether to reuse the template. English stands in `docs/index.html` and reads without JavaScript, German comes from `PAGE_DE` in `docs/content.js` with `?lang=de`, and `tests/test_page_text.mjs` keeps both key sets equal. The Pages workflow publishes it at <https://chpollin.github.io/second-brain-vault/> from the last state pushed to `main`, as [integration](integration.md#maintenance-and-distribution) describes, so local commits reach that address only after a push.

## Sections

| Section | Question it answers | Form |
|---|---|---|
| Entry | What is this, for whom, and what does a vault consist of? | Title, one sentence, audience line, two actions, and the three layers knowledge, rules and state with their files |
| Example | How is earlier knowledge found, decided and reused? | Stepper with named phases above the focus graph and note card; without the example data a static list of the phases |
| Vault and project repositories | How do the vault and the `knowledge/` folders of project repositories connect, and how does confirmed knowledge return? | One HTML diagram with two boxes and three relations, and a caption on what returns |
| Template contents | What does the template ship? | Four groups (synthetic examples, skills, rules and conventions, structure checks) with name and purpose per entry, linked to the files on GitHub |
| Start | How do I begin? | Requirements sentence, the clone route as copyable commands, and the seven agent steps with their prompts folded |
| Data and limits | What leaves the computer, and what does the template not do? | Two short lists |
| Methods and citation | Where do Research Mission Control, Promptotyping and Grounded Vault fit, and how is the template cited? | Linked list and one copyable citation; the licence stands in the footer |

The diagram rests on [Convention Knowledge Documents](../Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md), the Repo Directory and the skill `vault-orient`. Project Overview and Repo Directory point to the repository's `knowledge/INDEX.md`. A repository session reads concept and literature notes through `vault-orient` without writing. A finding that holds beyond its project returns as a handover with goal, paths, source and evidence and enters the responsible note in a vault session once accepted. Each arrow starts and ends at the two objects it connects. On narrow screens each relation stacks as source, arrow and target in reading order.

The seven agent steps follow the operator's sequence of 2026-11-04: create a vault, bring sources into Markdown, think through the structure, talk it through with the agent, let the agent build it, work in knowledge, make it findable for the agent. The template enters at step 5, where the agent copies its rules, conventions, checks and skills into the new vault.

## Example

The example plays one episode in three coordinated parts, specified in `docs/episode.json` and rendered by `docs/hero.js`.

- The focus graph shows only the notes of the episode on hand-placed positions, so labels stay readable and no link passes behind a note it does not connect. `tests/test_hero_layout.mjs` checks placement and links. Pills are sized from the rendered label. A note's state shows as outline colour, width and dash, the decision note names its state in text above it, and a one-line legend explains the code. Every pill opens its note.
- The note card shows what the decision note says in the current phase. Its wikilinks become note buttons, and the cited notes are those highlighted in the graph. German readers see a translation of the English example note from `docs/content.js`, marked as such. The decision step shows each ground with a check mark, filing shows the linking notes, the test shows the finding and where it was recorded, and reuse compares the conditions with the new question.
- The stepper names each phase and its actor. Done, current and next differ by mark (check, filled number, outlined number) and weight. Each step button carries its full state in its accessible name, and the caption is a live region.

The example stands in its own band below the entry. The stepper with its heading and controls comes first, and on wide screens graph and card share a stage of fixed height below it, so the controls keep their position across phases. On narrow screens the stepper comes first with a status line for the current phase, the graph gives way to a list of the involved notes with their state, and the card follows at full height.

## Example domain

The example domain is a team's research data work: a photo archive project decides on the format of its archival masters, and an oral history project later checks whether the decision transfers to audio. It is synthetic. Its literature notes carry bibliographic entries only. `scripts/build_graph.py` turns it into `docs/graph.json`, whose notes and stems the example and the reading panel use.

## Knowledge explorer

The operator rejected the first list/graph/full-text workspace as too text-heavy on 2026-11-08. The next slice at `docs/explorer.html` answers one question: why are photo masters TIFF, how does JPEG derive from them, and where does this decision stop applying? The previous generic note browser remains at `docs/notes.html` as a secondary destination. The example on the method page stays unchanged.

The initial view contains three compact grounds feeding the TIFF master, a directed derivation to the JPEG access copy, and the boundary between photographs and audio. The rejected JPEG-only alternative remains selectable. These are editorially curated relationships justified by the example decision and its named sources, not relation types inferred from graph topology. One selected object reveals its exact original passage and source line immediately beneath that object. Selecting another object moves the single evidence passage; Escape closes it. Native buttons provide pointer and keyboard access. Selection is addressable and follows browser history.

The wide composition is a spatial argument, with reasons left, master centre, derived copy right, and scope below. Narrow screens preserve direction through a vertical flow and reflow the evidence at its selected object. Source passages remain English and are identified as originals. German labels are editorial condensations. The existing DHCraft type and colour tokens apply. No search, filters, full note column or repeated evidence inventory appears in this slice. Synthetic data and source provenance remain explicit.

Acceptance tasks are to explain the TIFF grounds, identify JPEG as a regenerable access copy, and recognise that the image decision leaves audio open. The visual arrangement must communicate these before opening full documents. Evidence selection must stay at the selected object without blocking the composition. Human acceptance remains open until the operator examines the result.

## Visual system

The page uses the shared DHCraft web foundation, specified in [brand-assets `web/design.md`](https://github.com/DigitalHumanitiesCraft/brand-assets/blob/main/web/design.md) and copied unchanged to `docs/assets/dhcraft/` (tokens, building blocks, copy script, watercolour mark, fonts). Its design document and specimen page are not copied, because the site serves only what the page loads. `docs/site.css` maps the short names used by the page and the explorer pages onto the `--dh-*` roles and adds project colours only, the note states of the example (`--st-*`) and the three layer colours. Header, footer, buttons, code blocks with copy buttons and the skip link are the shared building blocks. The page follows the system's light or dark setting.

Recorded overrides of the shared values: the light note-state colours are darkened from the brand hues so that marker text reaches 4.5:1 on paper, and the anchor offset grows on narrow screens where the header takes two rows. Sections are separated by alternating grounds. Borders are drawn for controls, the note card, the diagram boxes and the code blocks.

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
