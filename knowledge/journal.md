# Journal

## Open

Nothing open.

## 2026-11-14 Handoff file dissolved into the journal

By the operator's decision of 2026-11-14, Promptotyping repositories no longer keep `knowledge/handoff.md`, and the journal opens with what is open. The handoff file held no open point, so nothing was carried over, and the index now routes received input to this section. The template's Convention Knowledge Documents, the skill `project-knowledge` and its evaluation cases still describe `handoff.md` as part of every knowledge base; they change only with the operator's rule decision for the template.

## 2026-11-11 Site data no longer built

The method page no longer read `docs/data.json`, yet the workflow built and published it, and the commit check refused a commit whenever it was stale. Its generation left the workflow, `check_vault.py`, the README, the page prompts and the skills, and the privacy test now reads `docs/explorer.json`. `scripts/build_site.py` keeps only the in-memory file model whose task-trace tests still run, and its removal together with `tests/test_build_site.py` is left to the owner. The German figure and page text name the Repo-Verzeichnis, and both figures leave more space between arrowheads and boxes.

## 2026-11-10 Main figure reduced and the closing step named curate

On the owner's review the figure keeps its three columns, colours and icons but shows each block as a title and one line, without sublines, file rows or a two-line link label, and stays legible at 800 pixels. A German version was added. The closing step of a session is now called curate in figure, page, Convention Knowledge Documents and the register of skills, recorded in the Decision Log.

## 2026-11-10 Method page after the owner's review

The owner chose the Promptotyping start page as the reference and recorded the decisions in brand-assets `web/design.md`. The page now opens light with a dark toggle, starts with title, abstract and a standalone SVG figure of vault, agent session and project repository in the colours of the mark, explains the figure in three paragraphs of prose, sets the take-away files apart, and keeps the seven-prompt demo, which was run in full on a fresh clone and improved in three prompts. Details, colour roles and the demo run are in [design](design.md#main-figure). The figure is also exported as PNG at double resolution under `docs/images/`.

## 2026-11-10 Method page as one static page in seven parts

The owner found the first rebuild still too text-heavy and too structured and asked for one static page. The page now follows the seven parts of the DHCraft method sites, fixed in brand-assets `web/design.md` and shared with Promptotyping and Grounded Vault: title and abstract, a main figure with vault layers, agent session and project repository, origin, terms, reuse, a prompt demo on the synthetic photo archive, and limits with licence and citation. The playable example with stepper, focus graph, note card and reading panel, the graph builder and its test, the template contents section and the section navigation were removed. The decision view and the note browser remain as one link. The shared web files are MIT with the logo excluded, recorded in `LICENSE.md` and the copied licence file. Slide screenshots under `docs/images/` were regenerated. Details are in [design](design.md#decisions).

## 2026-11-10 Method page rebuilt on the shared DHCraft foundation

Commissioned to make Second Brain Vault, Research Mission Control and Promptotyping reusable from one level, with finished frontends in one corporate design. The page now answers from its entry what the vault is, its layers, how it connects to project repositories and their `knowledge/` folders, what the template contains, how to start, its limits, the related methods and the citation. The diagram of vault and repositories is new and draws on Convention Knowledge Documents, the Repo Directory and `vault-orient`. The growing build graph, the folded reference and the page's own tokens and fonts were removed; the shared files from brand-assets now carry tokens, header, footer, buttons and code blocks. Slide screenshots at 1600 by 900 lie under `docs/images/`. Details and checks are in [design](design.md#decisions) and [design](design.md#evidence).

Open from the independent review and the build: the licence of the shared DHCraft files in a public MIT repository waits for the brand-assets decision; the explorer page `explorer.html` exists only in German; graph labels in the example stay small between 62 and 80rem; the reading panel is not modal on phones; copy buttons share one accessible name; title and description stay English on `?lang=de`. Operator acceptance of the page is open.

## 2026-11-10 README, instructions and method page for outside readers

Commissioned to make the template understandable and reusable for colleagues who know Git and Markdown but not the source owner's system. A self-trial from a fresh clone in a scratch folder ran the three builders, the check (`hard: 0`, `measured: 0`), the 28 Python tests, the fixture check with its two seeded findings, the commit hook refusing a note with an unregistered tag and the AGENTS.md generator. Opening the vault in Obsidian and an agent conversation were not executed.

The README now follows purpose, uses, prerequisites, start, governance, layout, omissions, related methods, licence and citation. It explains agent and operator, the stale `docs/data.json` that blocks commits after every note change, the `python` name the hook calls, the disposable copy for the repair trial and the publication risk of the Pages workflow for a personal vault. `CLAUDE.md` defines the operator, states that rules change by the operator's decision and that agent reports count as unverified until checked, and names the places a new owner adapts first. `AGENTS.md` was regenerated. The specification drops the obsolete note on a third-party website exclusion, which the source owner removed on 2026-11-10, and records the agent terminology. The method page changes are recorded in [design](design.md#decisions). An independent fresh-context review of README and page was incorporated where its objections were supported by the files.


## 2026-11-09 Focused visual decision view

The operator rejected the generic workspace as text-heavy and commissioned one visual understanding task. The explorer entry point now shows TIFF grounds, JPEG derivation, rejected JPEG-only storage and the image/audio boundary. Selecting an object opens one original passage in place. The prior note browser remains a secondary destination. Source notes remain unchanged. The design contract and browser evidence are maintained in [design](design.md#knowledge-explorer). The operator subsequently authorized curation, commits and push on 2026-11-09. Source repositories remain intact.

## 2026-11-08 Knowledge explorer commissioned

The operator assigned the useful functions of `vault-graph` to the Second Brain frontend, initially with synthetic example data, and deferred the old deletion tasks. The explorer is a separate working view alongside the guided method page. The design now defines improvement through understanding a selected connection from its passage, following relevant context and identifying a possible reading or maintenance action. Integration records the source and public-data boundary. Specification and README include the synthetic-only builder, and evaluation supplies the corresponding reader tasks. WEFT relation types remain an optional later input when an actual task needs them.

The source project's `knowledge/methodik.md` and `knowledge/architecture.md` were read at checkout revision `2efebaba0e721908e344e273a494736098565b18`. Their distinction between structural findings, diagnosis candidates and semantic hypotheses informed the new design. The source analysis stack and private exports remain separate. The source repositories and local clone are retained. Implementation and observed browser checks have their maintained record in [design](design.md#evidence). Operator acceptance and the value in real knowledge work remain open.

## 2026-11-08 General function clarified

The operator defined Second Brain as bringing together knowledge held by a person, knowledge about a person or knowledge within a domain, and organizing, connecting and where needed modelling it for further use. Research questions and arguments are possible outcomes, alongside other task-dependent results. The author's personal research environment is one application. Project, README, specification and research workflow now preserve that distinction, including the difference between a collection about a person and the optional Research Persona.

Additional structures are to develop through actual work. The workflow explains how sources, notes, links and overview documents can carry the initial arrangement in Obsidian. Explicit relations or models are added for a demonstrated need. The existing manuscript, proposed study and strand-note proposal retain their own scope and status. No new field, relation vocabulary, study or publication is introduced.

## 2026-11-08 Note-network method integrated

The operator assigned the reusable knowledge of the retired Agentic Zettelkasten experiment to Second Brain. Comparison with the current template confirmed that the strand-note proposal already retained argument relations, producer attribution and a two-condition test. The research workflow now also explains selection paths, relevant exclusions, derived contexts and the status of agent-proposed connections. The evaluation protocol links an optional isolated-note versus connected-note comparison to its existing controls and episode record. Integration records this transfer without adding another method project, mandatory identifiers, lifecycle fields or run infrastructure.

The source repository had no commit at inspection. The documents below were read in full and identified by SHA-256. No experiment was run, no Luhmann Archive content or source tools were copied, and no claim of research benefit or automatic retrieval follows. The strand-note convention remains a proposal. The source repository remains intact.

| Source document in Agentic Zettelkasten | SHA-256 at integration |
|---|---|
| `knowledge/project.md` | `09af395417a01ca764f82841a4f0ceca105bc4732f115a7c7b1eeabedb1b21f0` |
| `knowledge/method-specification.md` | `e31fb4078b2612bc5889c897975cf310decacf44cbb771804016296f2d576c11` |
| `knowledge/experiment-protocol.md` | `f46099013229293bdfee99e6e5a64509e87f109e4efee2652e54f8dbd2da8b8b` |
| `knowledge/governance.md` | `5a373e478a617973f9a9fa5ac658494773f4822a12e9792cf3679704cca6065e` |

Verification regenerated the derived site and graph data, passed the vault structure check without hard or measured findings, and passed the Python tests, Node.js link and layout tests and page-script syntax checks. Ruff lint and formatting checks could not run because Ruff is not installed in the available Python environment. No source code was changed.

## 2026-11-05 Knowledge checked against the unpushed method page

The curation round of 2026-11-05 compared the knowledge documents with the method page as committed locally. The page commits from efd4ca9 to 0475124 were not yet pushed during this round (they reached origin/main with 43ed8c7 by the push of 2026-11-05 21:41), so the opening sentence of [design](design.md), which placed the page at its public address, named a state that only a push establishes. Design now names `docs/` as the page and the Pages workflow as its route to the address. The [specification](specification.md) listed only the Node.js link test, while `.github/workflows/pages.yml` also runs `tests/test_hero_layout.mjs` and `node --check` on every page script. Its workflow description and verification commands now carry both.

The open point of 2026-11-04 on the vault's Repo Directory is resolved there, since its entry names this repository as its own maintenance source since 2026-10-31. Still open are section 5 of the [manuscript](paper.md), which names the explorer and the demo as the public implementation and remains an editorial decision, and two README passages that still speak of graph layouts and of removing the explorer. Both were reported to the operator with a proposed wording.

Verification ran `python scripts/check_vault.py` without hard or measured findings, `python -m pytest -q`, `node --test tests/test_markdown_links.mjs tests/test_hero_layout.mjs` and `node --check` on every page script, all passing, and a check of every relative link and anchor in `knowledge/` without findings. The generated site data was not rebuilt, and no page file changed.

## 2026-11-04 Combined hero replaces the whole-vault graph

After operator criticism of the numbered stepper, the crowded graph and the hero, three hero variants were compared by model readers and a model UI reviewer, recorded in [design](design.md#evidence). On the operator's instruction the recommended combination became the live hero: a focus graph of the episode's notes, the decision note as a card, and a stepper with named phases and actors. The episode data in `docs/episode.json` now holds note positions, links and per-phase states, `docs/hero.js` renders them, and `tests/test_hero_layout.mjs` rejects overlapping notes and links behind unrelated notes. The episode module, the graph's episode staging and the lab variants were deleted, and the stylesheet was consolidated. The reference gained one line each on the optional research persona and on parallel review agents.

A fresh model reviewer's findings were worked in. Verification covered pytest, Ruff, the vault check, the Node tests, syntax checks, and browser walks through all seven phases at 1440 by 900, 1280 by 720 and 390 by 844 in both languages, including keyboard focus and tab order. A human reading and the operator's acceptance remain open.

## 2026-11-04 Method page replaces explorer and demo

The operator asked for a public page that explains Second Brain to readers without prior knowledge and serves as the slide reference for a workshop. The [method page](design.md) replaced the structure explorer and the work and knowledge demo at the site root. Three layout variants (guided story, workspace, build along) were built on one shared frame and content. The operator chose build along, and the other two were removed. After operator feedback the page was cut to three text levels without nested boxes, and the build section now follows the operator's seven steps from source intake to overview pages for agents. The example domain is a synthetic research data team, so no personal content enters the site.

The site no longer serves `knowledge/`. `tests/test_site_privacy.py` guards the served files. Agent sessions recorded for the page had run under the owner's personal configuration and were not published. The demo source under `demo/`, its build and sync scripts, its tests and the demo contract `interface-demo.md` were deleted at the operator's instruction. That contract described source preservation, the mapping of point kinds and the browser-local responses of the retired demo, and stays readable in Git history.

A second review round merged the explanation of what a vault is and the example into the hero, where the graph now plays a seven-phase episode that includes testing the result, and reduced data, maintenance and reference to one section of notes and one file tree. The facet comparison with the manuscript added the return of artefact findings, the separate human judgements, operator points, project knowledge staying with its project and the agent's own search to the page.

Verification covered pytest, Ruff, the vault check, the Node link test, syntax checks of the page modules and browser checks at desktop and phone width in both languages. Five model reader tests are recorded in [design](design.md#evidence). A last cleanup removed the unused second graph layout. Open: the manuscript's section 5 still names the explorer and demo as the public implementation, an editorial decision. The vault's Repo Directory still describes this repository as a snapshot. A skill for building a vault's structure from the owner's sketch and a convention for source intake were proposed for the template.

## 2026-10-31 Strand notes proposed

Added Convention Strand Notes as a proposal with `status: idea`, listed in the convention index as not yet in force. A strand note orders notes into an argument with a small relation vocabulary, records the lineage of an idea in its combining steps and names its producer in a sentence instead of a field. The relation types, the producer values, the two-condition test and the failure conditions were taken over from an earlier, never executed Agentic Zettelkasten method experiment. Its identifier scheme, artefact classes and context builder were left out, because the template's titles, conventions and explorer already cover them. The proposal comes into force only through a curation round, preferably after use in the personal vault, where rules are revised first.

## 2026-10-31 Maintenance moved into this repository

The operator decided to reduce the number of repositories and to treat `knowledge-structures` as a finished simulation. A last snapshot (dab95c0) brought this repository to the state of the former maintenance folder, including the procedures of 2026-09-24 and the integrated manuscript of 2026-10-17. Its added lines were checked for private paths, names and research material before the snapshot was kept. From now on this repository is edited directly. The former folder is frozen, and the private research context exporter stays outside the public template. Pushing and archiving `knowledge-structures` remain with the operator.

## 2026-10-17 Technical closure of manuscript blockers

The Human User asked for the remaining technical work to be verified and completed independently of editorial decisions. The parent source-register binding V2 still pointed to a vault note consolidated in vault revision f0dcc1ec. It now resolves to Knowledge Engineering and names the retained section Bestand, Wissensbasis und Wissenssystem. The identifier and assertion statuses are preserved. This routing repair supplies no renewed scholarly verification.

The existing manuscript and its directly dependent knowledge documents were preserved without editorial changes. The explorer data were rebuilt with scripts/build_site.py. The generated docs/data.json remains ignored and reproducible. The parent evidence-chain check and the template hard and integrity checks now pass. The verification boundary in the integrated-manuscript entry below records the earlier failed checks and remains as historical evidence. Technical closure supplies no author acceptance, study result, publication authorization or new manuscript comparison.


## 2026-10-17 Integrated Second Brain manuscript

Revised the existing paper at the operator's request. The conceptual contribution connects artefact findings returning to maintained project knowledge with the later recovery and justified transfer of that knowledge. The existing evaluation protocol and episode template now retain the requirement, artefact revision, observed behaviour, interpretation and actual knowledge revision separately. Project, integration and workflow documents reflect the same relationship. This is a revised draft and prospective study protocol, without author acceptance, study execution or publication.

### Design-source and contribution mapping

| Read source | Contribution retained | Boundary |
|---|---|---|
| Second Brain paper, project, integration, research workflow, evaluation and skill-evaluation at parent revision 02a461a | Cross-session recovery, actual reads, authorized revision, later application and maintenance effort | Technical checks and dated development observations remain distinct from research effects |
| Knowledge Structures manuscript, register, assertions and distillates in the parent repository at 02a461a | Knowledge kinds, organizational patterns, collection purposes, structure versus access | Parent README declares a conceptual simulation. No simulated production case or assertion status becomes empirical evidence |
| Grounded Vault method manuscript, paper/40_output/grounded-vault-method.md, read file SHA-256 F03DBD9C7E9F0B5C1AE7D45E08008CAC0C5AEBC0107F34BE7B17B7CA79F4D830 | Traceability, claim support, restricted human-verified evidence terminology | Review distributions and original claims remain with that method, without importing a quality effect |
| Promptotyping knowledge/paper-specification.md, read file SHA-256 0E8FB6DB020109F7B0ED03F1632DE868E8F5B000DF545080DD18CCBCDB9C775D | Data, project knowledge and artefact distinction; recurrent work modes; artefact findings returning to knowledge; purpose-specific acceptance | Current specification's publication boundary overrides historical manuscript links. Current author-controlled manuscript unavailable. Historical chapter representation is a dated comparison source, not its replacement |

Original manuscripts and projects remain intact. Promptotyping retains its separate ZfdG paper project. Research Mission Control retains its separate coordination contribution and the planned title recorded in integration.md. The Agentic-Zettelkasten method experiment remains separate. No second manuscript authority or new study plan was created.

### External-source review

A read-only literature reviewer read the complete main texts and substantive appendices of the existing source set. The main agent checked the manuscript claims against relevant original passages. Reading does not establish replication of experiments or independent verification of plotted values. References cited by those works were not thereby read.

| Source version | Claim-bearing sections checked | Use and limit |
|---|---|---|
| A-MEM v11, arXiv:2502.12110 | Sections 3.1-3.3 and evaluation scope | Linked evolving memory notes already exist; conversation benchmarks establish no scholarly transfer effect |
| LongMemEval v2, arXiv:2410.10813 | Sections 3.3, 4.1, 5.5 and E.5 | Retrieval and application assessed separately; information updates do not establish epistemic verification |
| ACE v3, arXiv:2510.04618 | Sections 2.2, 3.1-3.2 and 4.1; reviewer also read PDF prompt figures | Structured incremental context maintenance is prior work; benchmark effects remain within that setting |
| Cemri et al. v3, arXiv:2503.13657 | Section 4 and verification discussion | Reported failure classes motivate source and task checks; agent agreement is not an independently tested truth criterion |
| Co-STORM, EMNLP 2024.554 | Sections 3.1-3.3 and Limitations | Participation, mind map, prior-knowledge adaptation and user-control limits; no longitudinal research effect |
| Sapkota et al. v5, arXiv:2505.10468, Information Fusion 126, 103599 | Section 2 and tool-feedback account | Conceptual review informs an explicitly local working definition; no taxonomy-as-consensus or empirical effect claim |
| Weng 2023 | Agent System Overview and Tool Use | Technical architectural overview, distinguished from peer-reviewed effect evidence |

The failed acceptance-ordering trial, persona baseline without an observed failure and inconsistent maintenance despite an existing rule remain in the paper. The current Promptotyping manuscript still needs author-side comparison before publication. Selecting actual research episodes and any publication route remains with the author.

### Verification boundary

The parent evidence-chain check already failed before editing because source binding V2 points to an absent vault document. That register is outside this commission's write scope. After manuscript revision the child hard check reports stale generated docs/data.json, which includes knowledge files. No UI or generated-site file was changed under the knowledge-only authorization. These failures prevent a compliant commit. Targeted verification passed: local Markdown targets in the changed knowledge files resolve; code fences and UTF-8 text are intact; check_vault.py --integrity reports no hard or measured finding. build_site.render() produced valid JSON in memory containing the revised paper and protocol without writing generated output. The design-source hashes above were checked against the actual source files. git diff --check passed. The parent check was repeated and retains the same missing V2 binding. No code or UI change, remote operation, commit, research episode or human acceptance was performed.


## 2026-09-24 Paper development and workflow design

Added `paper-develop` and `workflow-design` at the operator's request as separate procedures in the maintained template. The former preserves the contribution, source coverage and accepted decisions during compact scholarly drafting. The latter traces agentic task handling, checks, decision authority and the consequences of feedback. Existing synthesis, knowledge maintenance and prose rules retain their responsibilities. Only general procedures and fictional cases enter the template. The source discussion and project-specific evidence stay in the personal vault.

The [skill evaluation](skill-evaluation.md#paper-and-workflow-development-trials) records the development basis, bounded read-only trial and its limitations. The files provide explicitly readable procedures. They do not establish automatic discovery in a separate host or a global installation.

Critical review narrowed the boundary between source synthesis and manuscript revision, made workflow explanation, review and new design conditional on the actual task, and supplied concrete texts for revision trials. Separate evaluators exercised the skills individually. A workflow trial invented acceptance before merge from an instruction that required acceptance without specifying its order. The resulting correction preserves explicit ordering and has a countercase with an actual pre-merge rule. The evaluation record retains this failed interpretation.

## 2026-09-20 Compact knowledge views and shared framing

The interface demo now opens Wissen as a compact Explorer with actual folder branches, shared document filters and complete original reading. Verbindungen uses a directed local network whose explicit expansion preserves existing node positions and whose edges expose literal reference occurrences. Folder containment, document type, maturity and links retain separate meanings. The template explorer and the work interface share their header, footer, typography and surface tokens. Spacing replaces horizontal section separators. The template's prescribed reading paths remain inspectable. No observed agent execution is implied.

The maintained generic core excludes private readings and local write paths. Local browser checks verified context preservation, source fidelity, quoted edge evidence, explicit expansion, narrow layouts, enlarged text, shared navigation and recovery after a failed knowledge request. Independent browser review identified selection and history defects in the upstream integration, and the corrected controller retains loaded catalog depth and keyboard return. These observations support a functioning interface trial. The [research workflow](research-workflow.md) still requires a separate task comparison and researcher acceptance.

## 2026-09-20 Public work and knowledge demo

The operator requested publication of the revised work interface with the default public template. The interface demo adds the existing project circles, flat contribution views, an expandable knowledge map and complete source reading under `docs/demo/`. The structure explorer keeps its root address. The copied generic core excludes private project readings and mappings, source snapshots and inbox submission. The static adapter reads only this template's permitted Markdown and keeps responses in a separate browser storage namespace. Source lines, revisions and unresolved links remain inspectable. The [research workflow](research-workflow.md) supplies the evaluation criteria without establishing measured research benefit.

Local verification exercised the template project, its full Summary paragraph, question storage, contribution view, knowledge map, exact source reading and passage selection. The narrow viewport retained its width without horizontal overflow. The inspected browser routes produced no JavaScript errors, failed requests or local API requests. Source fidelity, deterministic generation, private-input exclusion, ambiguous references and stale output rejection were checked through the automated suite. Template checks, JavaScript checks and the configured Python lint and formatting checks passed. Publication and operator acceptance require their own evidence.

## 2026-09-20

The design conversation and session retrospective were synthesized in [research workflow](research-workflow.md). The document connects inquiry, bounded delegation, interface requirements and authorized knowledge revision. It records the observed gap between a review copy and maintained knowledge, while keeping the proposed examination and later reuse separate from completed development checks. Portfolio-specific details remain outside the reusable synthesis.

The revised manuscript was integrated after review of its definitions, references and evaluation boundaries. It defines a research project and a personal research environment, adopts the functional AI-agent definition from the source vault, and explains documentary responsibilities in connected prose. README and specification now identify explorer sequences as prescribed reading rather than observed execution. The source vault's project overview and template description were aligned with the research framing and linked to the maintained manuscript and evaluation protocol. Technical checks and bounded development observations remain distinct from scholarly acceptance and the proposed research study.

The accepted framing identifies Second Brain as a personal research environment for working with AI agents. Project knowledge separates purpose, template requirements and integration boundaries. The former `template.md` remains a routing address for external references. Its design decisions and derivation history were retained in specification, integration and this journal. The README connects the maintained vault, repository knowledge, skills, conversation and user interfaces. Repository routing and cross-project transfer are defined in the knowledge-document convention and applied by the relevant skills. New synthetic cases specify expected behaviour without claiming an executed behavioural study.

Independent review identified a test that confused file existence with public exportability. The corrected test and a regression case preserve the exclusion of an existing private persona. After integration, the generated agent instructions and explorer were refreshed. Structural checks reported no findings, and the Python tests, Ruff lint and formatting checks passed. Historical skill trials remain dated development reports with their evidence limits. A prospective paper and actual research-use evaluation remain separate from these technical checks.

Explorer links now resolve relative to the displayed document. Heading and footnote links retain its route. Regression tests check these paths and reject executable URL schemes. Missing files receive a neutral availability message, and empty relationship sections no longer imply that a document has no references.

The Pages workflow builds explorer data from source before its checks and artifact deployment. Generated `docs/data.json` is excluded from versioned distribution. Local checks and preview require a fresh build. The public repository was synchronized, Pages was configured to use the workflow, and [the first source-built deployment](https://github.com/chpollin/second-brain-vault/actions/runs/35515094423) passed. The deployed README and its knowledge link were inspected in the browser.

The operator requested implementation of the manuscript and its proposed research process. The [paper](paper.md), [evaluation procedure](evaluation.md) and [episode template](episode-template.md) are maintained together and linked from the README. Review corrected a missing connection in the workflow diagram and an acceptance-only definition of an episode that would exclude unsuccessful cases. Rejected and unresolved outcomes remain part of the proposed study. Organization and civilization metaphors remain a short future-work discussion. Publication of the design does not establish empirical benefit.

A fresh-context subagent recovered the component boundaries and access conditions from the published revision. Its answer was checked against the cited documents and the explorer's data read. The [bounded recovery record](skill-evaluation.md#repository-scope-recovery-check) distinguishes this documentation check from a research episode, whose usefulness judgement and later reuse remain unobserved.

## 2026-09-19

The structural exhibit became a standalone English vault template derived manually from the personal source vault. Its synthetic content abstracts the source's rules and procedures. The research context exporter moved into the separate `second-brain-exporter` directory. Distribution uses a public snapshot with the maintenance folder retained as source. A core-and-optional-packs design was considered and dropped in favour of dependency-aware removal. Initial skill trials and the later persona trial are recorded in [skill evaluation](skill-evaluation.md).
