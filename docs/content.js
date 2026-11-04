// All page text in English and German, so both languages carry the same statements.
// Terms keep one translation throughout; the term list stands in knowledge/design.md.
// Facts about tools, costs and data handling follow the providers' pages linked here,
// read on 2026-11-04.

export const LINKS = {
  obsidian: "https://obsidian.md",
  obsidianPricing: "https://obsidian.md/pricing",
  claudeCode: "https://code.claude.com/docs/en/setup",
  claudeData: "https://code.claude.com/docs/en/data-usage",
  codex: "https://learn.chatgpt.com/docs/codex/cli",
  docling: "https://github.com/docling-project/docling",
  groundedVault: "https://github.com/DigitalHumanitiesCraft/grounded-vault",
  git: "https://git-scm.com/downloads",
  python: "https://www.python.org/downloads/",
  template: "https://github.com/chpollin/second-brain-vault",
  zip: "https://github.com/chpollin/second-brain-vault/archive/refs/heads/main.zip",
};

export const TEXT = {
  en: {
    lang: "en",
    switchTo: "Deutsch",
    switchLabel: "Seite auf Deutsch anzeigen",
    skip: "Skip to content",
    nav: { understand: "Understand", build: "Build", episode: "In use", data: "Your data", reference: "Reference" },
    template: "Template",
    example: "Example",
    hero: {
      title: "Second Brain Vault",
      lead: "A folder of linked text notes on your own computer, in which earlier thinking stays findable together with its reasons. An AI assistant helps you keep it by finding and proposing, and you decide.",
      who: "For people in research, institutions and companies who work with knowledge across projects. No programming needed.",
      watch: "See how it works",
      build: "Build your own",
      hint: "Each dot is a file. Hover or tap one to see what it is.",
    },
    graph: {
      label: "Knowledge graph of an example vault",
      groups: {
        concept: "Concept note", moc: "Overview page (map of content)", literature: "Literature note", project: "Project overview", source: "Source converted to Markdown",
        core: "Rules for the AI assistant, read first in every session", control: "Control document of the vault", rule: "Rule or convention",
        skill: "Skill, a written procedure for a task", operations: "Running the vault", check: "Automatic check",
      },
      legend: { source: "Sources", concept: "Concepts", moc: "Overview pages", literature: "Literature", project: "Projects", control: "Control documents", rule: "Rules", skill: "Procedures" },
      decide: "You decide",
      checkConditions: "Check conditions",
    },
    understand: {
      title: "What it is",
      stations: [
        ["Text files", "Every note is a Markdown file on your computer."],
        ["Obsidian", "A free app that shows the files and the links between them."],
        ["AI assistant", "Claude Code or Codex reads the vault, finds notes and proposes changes."],
        ["You", "You decide what is taken over."],
      ],
      principle: "Every statement has exactly one place. Other notes link to it instead of copying it.",
    },
    build: {
      title: "Build your own vault",
      tools: [
        ["Obsidian", "free", LINKS.obsidian],
        ["Claude Code or Codex", "paid plan or account", LINKS.claudeCode],
        ["Docling", "free, runs locally", LINKS.docling],
        ["Git and Python", "free, for the checks", LINKS.git],
      ],
      toolsLabel: "You need",
      copy: "Copy", copied: "Copied", copyFailed: "Copying failed, please select the text",
      steps: [
        { title: "Create a vault", body: "Make an empty folder and open it in Obsidian with “Open folder as vault”.", prompt: "", added: "An empty vault." },
        { title: "Bring your sources into Markdown", body: "Docling turns PDFs, slides and documents into Markdown on your computer. Keep the originals and leave the converted text as it is. For statements that must be traceable to the exact source passage, Grounded Vault adds a stricter chain.", prompt: "Convert the files in [folder] with Docling into Markdown in the folder Sources/. Do not edit the converted text. List pages where tables or scans came out wrong.", added: "Your sources as Markdown files, not yet connected.", links: [["Docling", LINKS.docling], ["Grounded Vault", LINKS.groundedVault]] },
        { title: "Think through your structure", body: "How do you work? Write down your projects, fields of knowledge, proposals, administration and where your to-dos live. This is your thinking, not the assistant's.", prompt: "My projects: …\nMy fields of knowledge: …\nRecurring work (proposals, administration, teaching): …\nWhere my to-dos should live: …", added: "A sketch of your structure." },
        { title: "Talk it through with the assistant", body: "Let the assistant ask about gaps and overlaps before anything is created.", prompt: "Here is how I work: [your sketch]. Ask me up to five questions about gaps and overlaps, then propose a folder structure. Do not create anything yet.", added: "A structure you have both checked." },
        { title: "Let the assistant build it", body: "The assistant creates the folders, the start page HOME and the work list ACTIVE-WORK, and writes the structure into CLAUDE.md. That file is read at the start of every session, so the assistant knows the vault from its first sentence. These written rules are the vault's governance.", prompt: "Use the Second Brain Vault template (github.com/chpollin/second-brain-vault) as the model. Create the structure we agreed on, write it as the topography in CLAUDE.md, put my to-dos into ACTIVE-WORK and show me the result.", added: "Your structure, with CLAUDE.md as the map for the assistant.", links: [["Template", LINKS.template]] },
        { title: "Work in your knowledge", body: "Take one project and turn its sources into small notes, one per concept, each linked to its source and the project.", prompt: "For [project], turn the relevant files in Sources/ into concept and literature notes with the skill vault-knowledge. One note per concept, linked to its source and the project overview. Show me the list before writing.", added: "Notes connected to sources and projects." },
        { title: "Make it findable for agents", body: "As the vault grows, give every field an overview page, a map of content, that lists its notes. Agents enter there and understand how the notes relate.", prompt: "Create an overview page (MOC) for each field with one line per note, link it from HOME and report notes that no overview page reaches.", added: "Overview pages that tie the vault together." },
      ],
    },
    episode: {
      title: "The vault in use",
      intro: "A team decides how to keep its photo scans and reuses the decision months later. Illustrated with synthetic notes.",
      play: "Play", pause: "Pause", prev: "Previous", next: "Next",
      stepOf: (n, total) => `${n} of ${total}`,
      actors: { you: "You", agent: "Assistant", both: "You and the assistant" },
      phases: {
        question: ["Ask", "You bring a question from a project.", "Which file format should the photo archive keep its masters in?"],
        recover: ["Find", "The assistant follows links to earlier notes and their sources.", "It finds the notes on archival masters and file formats, the scan protocol and the FAIR principles."],
        propose: ["Propose", "It drafts a note that records the decision with its reasons.", "Uncompressed TIFF for masters, JPEG for access copies, and the rejected alternative."],
        decide: ["Decide", "You check the reasons. Accepting, rejecting and “no change needed” are all valid.", "You compare the proposal with the notes it cites and accept it."],
        incorporate: ["File it", "The note gets its place, and the notes that link to it are brought up to date.", "The overview page and the project overview now point to the decision."],
        reuse: ["Reuse later", "Another project finds the decision and checks whether its conditions hold.", "The oral history project asks about audio. The decision covers still images only, so it informs a new decision instead of replacing it."],
      },
    },
    data: {
      title: "Your data",
      items: [
        ["Notes stay on your computer.", "Obsidian stores the vault locally and needs no account.", LINKS.obsidianPricing],
        ["Docling runs locally.", "Converting your sources sends nothing away.", LINKS.docling],
        ["The assistant sends what it reads.", "Your requests and the notes it reads go to the provider's model, not the whole folder. Whether they may be used for training depends on your plan. Anthropic's business and API plans exclude it by default.", LINKS.claudeData],
        ["Confidential material.", "Follow your organisation's rules, keep such material out of the vault or use an approved plan.", ""],
      ],
      source: "Source",
    },
    maintain: {
      title: "Keep it alive",
      items: [
        ["Switch on the checks", "Git then refuses a change that breaks a hard rule.", "git config core.hooksPath scripts/hooks"],
        ["New knowledge", "A source or insight becomes a note or extends one.", "vault-knowledge"],
        ["Ongoing work", "State and open questions are kept current in ACTIVE-WORK.", "active-work-report"],
        ["Review", "Broken links, unreachable notes and outdated copies are reported.", "vault-audit"],
      ],
    },
    reference: {
      title: "Technical reference",
      summary: "Folders, governance, document types and procedures of the template",
      intro: "Items marked Template come with the template, items marked Example are placeholders you replace.",
      folders: {
        title: "Folders",
        items: [
          ["/", "Template", "Control documents and the rules for the assistant, CLAUDE.md and AGENTS.md."],
          ["Domain folders", "Example", "One folder per field of knowledge with its notes and one overview page."],
          ["Literature/", "Example", "One note per source that was read."],
          ["Projects/", "Example", "One project overview per undertaking."],
          ["Writing/", "Template", "Your own texts. The assistant reports on them and does not rewrite them."],
          ["Vault Operations/", "Template", "Conventions, note templates, decision log, done log and the repository directory."],
          [".claude/rules/", "Template", "Rules that apply when the assistant opens a matching file."],
          [".claude/skills/", "Template", "Written procedures for recurring tasks."],
          ["scripts/", "Template", "The automatic checks."],
        ],
      },
      governance: {
        title: "Vault governance",
        intro: "The written rules that say how the vault is built, what goes where and how it may change.",
        items: [
          ["CLAUDE.md", "The map of the vault and the rules for the assistant, read at the start of every session. AGENTS.md is the same for other assistants."],
          ["Rules by path", "Apply when the assistant opens a matching file, for example every Markdown note."],
          ["Conventions", "Detail rules read when a task needs them."],
          ["TAG-TAXONOMY.md", "The permitted tags."],
          ["Three tiers", "Hard rules refuse a change, measured rules produce a to-do list, the rest is judgement during review."],
          ["Decision Log", "Why each rule holds."],
        ],
      },
      control: {
        title: "Control documents",
        items: [
          ["HOME.md", "The start page. Every note is reachable from here."],
          ["ACTIVE-WORK.md", "The current work state, next steps and open questions to you."],
          ["VAULT-OPERATIONS.md", "Which task uses which procedure, roles and the glossary."],
        ],
      },
      types: {
        title: "Document types",
        items: [
          ["concept", "One concept: summary, key points, connections, sources, related notes."],
          ["literature", "One source that was read, with author and year."],
          ["knowledge", "Combined knowledge, including overview pages and project overviews."],
          ["research", "A dated note that is not revised later."],
          ["specification", "A requirement or definition."],
          ["vault-organisation", "Documents about the vault itself."],
        ],
      },
      skills: {
        title: "Procedures (skills)",
        items: [
          ["vault-knowledge", "Checks, extends, researches into and merges notes."],
          ["vault-audit", "Reports defects across the whole vault."],
          ["vault-distill", "Turns notes into an outline or draft without changing them."],
          ["active-work-report", "Reports the work state and proposes updates."],
          ["project-knowledge", "Works from a project's knowledge folder and writes findings back."],
          ["vault-orient", "Reads the vault from another project without writing into it."],
        ],
      },
      zettel: {
        title: "Model: Luhmann's Zettelkasten",
        head: ["Zettelkasten", "Second Brain Vault"],
        rows: [
          ["A card with a fixed number", "A note with a unique file name"],
          ["A reference to a number", "A link to a file name"],
          ["A keyword register with few entry points", "HOME and the overview pages"],
        ],
      },
    },
    footer: {
      by: "A template by",
      license: "Text CC BY 4.0, code MIT.",
      example: "The notes in the graph are a synthetic example. Control documents, rules and procedures come from the template.",
      evidence: "The template is tested and ready to use. How much it helps in everyday research is being studied.",
      repo: "Repository", paper: "Manuscript", licence: "Licence",
    },
    panel: { close: "Close", missing: "This file is not part of the published template." },
  },

  de: {
    lang: "de",
    switchTo: "English",
    switchLabel: "Show this page in English",
    skip: "Zum Inhalt",
    nav: { understand: "Verstehen", build: "Aufbauen", episode: "Im Einsatz", data: "Deine Daten", reference: "Referenz" },
    template: "Vorlage",
    example: "Beispiel",
    hero: {
      title: "Second Brain Vault",
      lead: "Ein Ordner verbundener Textnotizen auf deinem eigenen Rechner, in dem frühere Überlegungen mit ihren Gründen auffindbar bleiben. Ein KI-Assistent hilft beim Pflegen, indem er findet und vorschlägt, und du entscheidest.",
      who: "Für Menschen in Forschung, Institutionen und Unternehmen, die projektübergreifend mit Wissen arbeiten. Programmieren musst du nicht.",
      watch: "So funktioniert es",
      build: "Eigenen Vault bauen",
      hint: "Jeder Punkt ist eine Datei. Fahre darüber oder tippe darauf, um zu sehen, was sie ist.",
    },
    graph: {
      label: "Wissensgraph eines Beispiel-Vaults",
      groups: {
        concept: "Begriffsnotiz", moc: "Übersichtsseite (Map of Content)", literature: "Literaturnotiz", project: "Projektübersicht", source: "In Markdown umgewandelte Quelle",
        core: "Regeln für den KI-Assistenten, in jeder Sitzung zuerst gelesen", control: "Steuerdokument des Vaults", rule: "Regel oder Konvention",
        skill: "Skill, ein beschriebener Ablauf für eine Aufgabe", operations: "Betrieb des Vaults", check: "Automatische Prüfung",
      },
      legend: { source: "Quellen", concept: "Begriffe", moc: "Übersichtsseiten", literature: "Literatur", project: "Projekte", control: "Steuerdokumente", rule: "Regeln", skill: "Abläufe" },
      decide: "Du entscheidest",
      checkConditions: "Bedingungen prüfen",
    },
    understand: {
      title: "Was es ist",
      stations: [
        ["Textdateien", "Jede Notiz ist eine Markdown-Datei auf deinem Rechner."],
        ["Obsidian", "Eine kostenlose App, die die Dateien und ihre Verweise zeigt."],
        ["KI-Assistent", "Claude Code oder Codex liest den Vault, findet Notizen und schlägt Änderungen vor."],
        ["Du", "Du entscheidest, was übernommen wird."],
      ],
      principle: "Jede Aussage hat genau einen Ort. Andere Notizen verweisen darauf, statt sie zu kopieren.",
    },
    build: {
      title: "Den eigenen Vault aufbauen",
      tools: [
        ["Obsidian", "kostenlos", LINKS.obsidian],
        ["Claude Code oder Codex", "bezahlter Plan oder Konto", LINKS.claudeCode],
        ["Docling", "kostenlos, läuft lokal", LINKS.docling],
        ["Git und Python", "kostenlos, für die Prüfungen", LINKS.git],
      ],
      toolsLabel: "Du brauchst",
      copy: "Kopieren", copied: "Kopiert", copyFailed: "Kopieren nicht möglich, Text bitte markieren",
      steps: [
        { title: "Vault anlegen", body: "Lege einen leeren Ordner an und öffne ihn in Obsidian mit „Ordner als Vault öffnen“.", prompt: "", added: "Ein leerer Vault." },
        { title: "Quellen in Markdown bringen", body: "Docling macht aus PDFs, Folien und Dokumenten Markdown, direkt auf deinem Rechner. Behalte die Originale und lass den umgewandelten Text unverändert. Für Aussagen, die bis zur genauen Quellenstelle belegbar sein müssen, ergänzt Grounded Vault eine strengere Kette.", prompt: "Wandle die Dateien in [Ordner] mit Docling in Markdown im Ordner Sources/ um. Bearbeite den umgewandelten Text nicht. Nenne Seiten, bei denen Tabellen oder Scans fehlerhaft herausgekommen sind.", added: "Deine Quellen als Markdown-Dateien, noch unverbunden.", links: [["Docling", LINKS.docling], ["Grounded Vault", LINKS.groundedVault]] },
        { title: "Die eigene Struktur überlegen", body: "Wie arbeitest du? Schreib deine Projekte, Wissensgebiete, Anträge, Verwaltung auf und wo deine To-dos leben sollen. Das ist deine Denkarbeit, nicht die des Assistenten.", prompt: "Meine Projekte: …\nMeine Wissensgebiete: …\nWiederkehrende Arbeit (Anträge, Verwaltung, Lehre): …\nWo meine To-dos leben sollen: …", added: "Eine Skizze deiner Struktur." },
        { title: "Mit dem Assistenten durchgehen", body: "Lass den Assistenten nach Lücken und Überschneidungen fragen, bevor etwas angelegt wird.", prompt: "So arbeite ich: [deine Skizze]. Stell mir bis zu fünf Fragen zu Lücken und Überschneidungen und schlag dann eine Ordnerstruktur vor. Leg noch nichts an.", added: "Eine Struktur, die ihr beide geprüft habt." },
        { title: "Vom Assistenten aufbauen lassen", body: "Der Assistent legt die Ordner, die Startseite HOME und die Arbeitsliste ACTIVE-WORK an und schreibt die Struktur in CLAUDE.md. Diese Datei liest er zu Beginn jeder Sitzung, so kennt er den Vault ab dem ersten Satz. Diese geschriebenen Regeln sind die Governance des Vaults.", prompt: "Nimm die Vorlage Second Brain Vault (github.com/chpollin/second-brain-vault) als Muster. Leg die vereinbarte Struktur an, schreib sie als Topografie in CLAUDE.md, trag meine To-dos in ACTIVE-WORK ein und zeig mir das Ergebnis.", added: "Deine Struktur, mit CLAUDE.md als Landkarte für den Assistenten.", links: [["Vorlage", LINKS.template]] },
        { title: "Wissen einarbeiten", body: "Nimm ein Projekt und mach aus seinen Quellen kleine Notizen, eine pro Begriff, jede verbunden mit ihrer Quelle und dem Projekt.", prompt: "Mach für [Projekt] aus den passenden Dateien in Sources/ Begriffs- und Literaturnotizen mit dem Skill vault-knowledge. Je Begriff eine Notiz, verbunden mit ihrer Quelle und der Projektübersicht. Zeig mir die Liste vor dem Schreiben.", added: "Notizen, verbunden mit Quellen und Projekten." },
        { title: "Für Agenten auffindbar machen", body: "Wächst der Vault, bekommt jedes Gebiet eine Übersichtsseite, eine Map of Content, die seine Notizen auflistet. Agenten steigen dort ein und verstehen, wie die Notizen zusammenhängen.", prompt: "Leg für jedes Gebiet eine Übersichtsseite (MOC) mit einer Zeile pro Notiz an, verlinke sie von HOME aus und nenne Notizen, die keine Übersichtsseite erreicht.", added: "Übersichtsseiten, die den Vault zusammenhalten." },
      ],
    },
    episode: {
      title: "Der Vault im Einsatz",
      intro: "Ein Team entscheidet, wie es seine Fotoscans aufbewahrt, und verwendet die Entscheidung Monate später wieder. Dargestellt mit synthetischen Notizen.",
      play: "Abspielen", pause: "Anhalten", prev: "Zurück", next: "Weiter",
      stepOf: (n, total) => `${n} von ${total}`,
      actors: { you: "Du", agent: "Assistent", both: "Du und der Assistent" },
      phases: {
        question: ["Fragen", "Du bringst eine Frage aus einem Projekt mit.", "In welchem Dateiformat soll das Fotoarchiv seine Master aufbewahren?"],
        recover: ["Finden", "Der Assistent folgt Verweisen zu früheren Notizen und ihren Quellen.", "Er findet die Notizen zu Archivmastern und Dateiformaten, das Scanprotokoll und die FAIR-Prinzipien."],
        propose: ["Vorschlagen", "Er entwirft eine Notiz, die die Entscheidung mit ihren Gründen festhält.", "Unkomprimiertes TIFF für Master, JPEG für Nutzungskopien, dazu die verworfene Alternative."],
        decide: ["Entscheiden", "Du prüfst die Gründe. Annehmen, Ablehnen und „keine Änderung nötig“ sind gleichermaßen gültig.", "Du vergleichst den Vorschlag mit den Notizen, auf die er sich stützt, und nimmst ihn an."],
        incorporate: ["Ablegen", "Die Notiz bekommt ihren Ort, und die Notizen, die auf sie verweisen, werden nachgeführt.", "Übersichtsseite und Projektübersicht verweisen jetzt auf die Entscheidung."],
        reuse: ["Später wiederverwenden", "Ein anderes Projekt findet die Entscheidung und prüft, ob ihre Bedingungen gelten.", "Das Oral-History-Projekt fragt nach Audio. Die Entscheidung gilt nur für Standbilder, sie informiert also eine neue Entscheidung, statt sie zu ersetzen."],
      },
    },
    data: {
      title: "Deine Daten",
      items: [
        ["Notizen bleiben auf deinem Rechner.", "Obsidian speichert den Vault lokal und braucht kein Konto.", LINKS.obsidianPricing],
        ["Docling läuft lokal.", "Das Umwandeln deiner Quellen schickt nichts weg.", LINKS.docling],
        ["Der Assistent sendet, was er liest.", "Deine Anfragen und die gelesenen Notizen gehen an das Modell des Anbieters, nicht der ganze Ordner. Ob sie zum Training genutzt werden dürfen, hängt vom Plan ab. Die Business- und API-Pläne von Anthropic schließen das standardmäßig aus.", LINKS.claudeData],
        ["Vertrauliches Material.", "Halte dich an die Regeln deiner Organisation, lass solches Material aus dem Vault oder nutze einen freigegebenen Plan.", ""],
      ],
      source: "Quelle",
    },
    maintain: {
      title: "Lebendig halten",
      items: [
        ["Prüfungen einschalten", "Git lehnt dann eine Änderung ab, die eine harte Regel verletzt.", "git config core.hooksPath scripts/hooks"],
        ["Neues Wissen", "Eine Quelle oder Einsicht wird zur Notiz oder ergänzt eine.", "vault-knowledge"],
        ["Laufende Arbeit", "Stand und offene Fragen werden in ACTIVE-WORK nachgeführt.", "active-work-report"],
        ["Durchsicht", "Tote Verweise, unerreichbare Notizen und veraltete Kopien werden gemeldet.", "vault-audit"],
      ],
    },
    reference: {
      title: "Technische Referenz",
      summary: "Ordner, Governance, Dokumenttypen und Abläufe der Vorlage",
      intro: "Was „Vorlage“ trägt, bringt die Vorlage mit. Was „Beispiel“ trägt, ist ein Platzhalter, den du ersetzt.",
      folders: {
        title: "Ordner",
        items: [
          ["/", "Vorlage", "Steuerdokumente und die Regeln für den Assistenten, CLAUDE.md und AGENTS.md."],
          ["Domänenordner", "Beispiel", "Ein Ordner pro Wissensgebiet mit seinen Notizen und einer Übersichtsseite."],
          ["Literature/", "Beispiel", "Eine Notiz pro gelesener Quelle."],
          ["Projects/", "Beispiel", "Eine Projektübersicht pro Vorhaben."],
          ["Writing/", "Vorlage", "Deine eigenen Texte. Der Assistent berichtet darüber und schreibt sie nicht um."],
          ["Vault Operations/", "Vorlage", "Konventionen, Notizvorlagen, Decision Log, Done Log und das Repository-Verzeichnis."],
          [".claude/rules/", "Vorlage", "Regeln, die gelten, wenn der Assistent eine passende Datei öffnet."],
          [".claude/skills/", "Vorlage", "Beschriebene Abläufe für wiederkehrende Aufgaben."],
          ["scripts/", "Vorlage", "Die automatischen Prüfungen."],
        ],
      },
      governance: {
        title: "Vault-Governance",
        intro: "Die geschriebenen Regeln, die sagen, wie der Vault aufgebaut ist, was wohin gehört und wie er sich ändern darf.",
        items: [
          ["CLAUDE.md", "Die Landkarte des Vaults und die Regeln für den Assistenten, zu Beginn jeder Sitzung gelesen. AGENTS.md ist dasselbe für andere Assistenten."],
          ["Regeln nach Pfad", "Gelten, wenn der Assistent eine passende Datei öffnet, etwa jede Markdown-Notiz."],
          ["Konventionen", "Detailregeln, die gelesen werden, wenn eine Aufgabe sie braucht."],
          ["TAG-TAXONOMY.md", "Die erlaubten Tags."],
          ["Drei Stufen", "Harte Regeln lehnen eine Änderung ab, gemessene erzeugen eine Arbeitsliste, der Rest ist Urteil bei der Durchsicht."],
          ["Decision Log", "Warum jede Regel gilt."],
        ],
      },
      control: {
        title: "Steuerdokumente",
        items: [
          ["HOME.md", "Die Startseite. Von hier ist jede Notiz erreichbar."],
          ["ACTIVE-WORK.md", "Der aktuelle Arbeitsstand, nächste Schritte und offene Fragen an dich."],
          ["VAULT-OPERATIONS.md", "Welche Aufgabe mit welchem Ablauf erledigt wird, Rollen und Glossar."],
        ],
      },
      types: {
        title: "Dokumenttypen",
        items: [
          ["concept", "Ein Begriff: Zusammenfassung, Kernpunkte, Bezüge, Quellen, verwandte Notizen."],
          ["literature", "Eine gelesene Quelle mit Autor und Jahr."],
          ["knowledge", "Zusammengeführtes Wissen, darunter Übersichtsseiten und Projektübersichten."],
          ["research", "Eine datierte Notiz, die später nicht mehr überarbeitet wird."],
          ["specification", "Eine Anforderung oder Festlegung."],
          ["vault-organisation", "Dokumente über den Vault selbst."],
        ],
      },
      skills: {
        title: "Abläufe (Skills)",
        items: [
          ["vault-knowledge", "Prüft, ergänzt, recherchiert und führt Notizen zusammen."],
          ["vault-audit", "Meldet Fehler im ganzen Vault."],
          ["vault-distill", "Macht aus Notizen eine Gliederung oder einen Entwurf, ohne sie zu ändern."],
          ["active-work-report", "Berichtet den Arbeitsstand und schlägt Aktualisierungen vor."],
          ["project-knowledge", "Arbeitet aus dem Wissensordner eines Projekts und schreibt Befunde zurück."],
          ["vault-orient", "Liest den Vault aus einem anderen Projekt, ohne hineinzuschreiben."],
        ],
      },
      zettel: {
        title: "Vorbild: Luhmanns Zettelkasten",
        head: ["Zettelkasten", "Second Brain Vault"],
        rows: [
          ["Ein Zettel mit fester Nummer", "Eine Notiz mit eindeutigem Dateinamen"],
          ["Verweis auf eine Nummer", "Verweis auf einen Dateinamen"],
          ["Schlagwortregister mit wenigen Einstiegen", "HOME und die Übersichtsseiten"],
        ],
      },
    },
    footer: {
      by: "Eine Vorlage von",
      license: "Texte CC BY 4.0, Code MIT.",
      example: "Die Notizen im Graphen sind ein synthetisches Beispiel. Steuerdokumente, Regeln und Abläufe stammen aus der Vorlage.",
      evidence: "Die Vorlage ist getestet und einsatzbereit. Wie viel sie im Forschungsalltag hilft, wird gerade untersucht.",
      repo: "Repository", paper: "Manuskript", licence: "Lizenz",
    },
    panel: { close: "Schließen", missing: "Diese Datei gehört nicht zur veröffentlichten Vorlage." },
  },
};

const STORE = "second-brain-vault-lang";

/** English is the default; ?lang=de or a remembered choice switches to German. */
export function currentLang() {
  const asked = new URLSearchParams(location.search).get("lang");
  if (asked === "de" || asked === "en") return asked;
  try {
    return localStorage.getItem(STORE) === "de" ? "de" : "en";
  } catch {
    return "en";
  }
}

export function rememberLang(lang) {
  try {
    localStorage.setItem(STORE, lang);
  } catch {
    // Storage can be blocked; the choice then holds for this visit only.
  }
}
