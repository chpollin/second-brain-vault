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
  template: "https://github.com/chpollin/second-brain-vault",
};

export const TEXT = {
  en: {
    lang: "en",
    switchTo: "Deutsch",
    switchLabel: "Seite auf Deutsch anzeigen",
    skip: "Skip to content",
    nav: { top: "Idea", build: "Build", notes: "Good to know", reference: "Reference" },
    template: "Template on GitHub",
    hero: {
      title: "Second Brain Vault",
      lead: "A Second Brain vault is a folder of linked text notes on your own computer, in which earlier thinking stays findable together with its reasons.",
      flow: [["Text files", "on your computer"], ["Obsidian", "shows the links"], ["AI assistant", "finds and proposes"], ["You", "decide"]],
      who: "For people in research, institutions and companies who work with knowledge across projects. No programming needed.",
      build: "How to build your own",
    },
    graph: {
      label: "Knowledge graph of an example vault",
      groups: {
        concept: "Concept note", moc: "Overview page (map of content)", literature: "Literature note", project: "Project overview", source: "Source converted to Markdown",
        core: "Rules for the AI assistant, read first in every session", control: "Control document of the vault", rule: "Rule or convention",
        skill: "Skill, a written procedure for a task", operations: "Running the vault", check: "Automatic check",
      },
      legend: { source: "Sources", concept: "Concepts", moc: "Overview pages", literature: "Literature", project: "Projects", system: "Rules for the assistant" },
    },
    episode: {
      title: "Example: a team and its photo archive",
      play: "Play", pause: "Pause", prev: "Previous", next: "Next",
      stepOf: (n, total) => `${n} of ${total}`,
      stepLabel: (n, total, name, actor, state) => `Step ${n} of ${total}: ${name}, ${actor}, ${state}`,
      stepStates: { done: "done", current: "current step", next: "upcoming" },
      noteStates: { asked: "where the question comes from", read: "read", found: "found, not yet read", proposal: "proposal", checked: "checked by you", accepted: "accepted", updated: "updated" },
      badges: { proposal: "Proposal by the assistant", decide: "You decide", accepted: "Accepted by you", conditions: "Conditions differ" },
      legend: "Yellow: where the question arises. Blue: read, filled once you checked it. Dashed: found, unread. Pink: proposal and links in use. Green: accepted or updated. Click a note to read it.",
      involved: "Notes in this step",
      card: {
        label: "The note of the example",
        noNote: "No note yet",
        askedIn: "Asked in",
        lookFirst: "Before anything new is written, the assistant looks for what the vault already holds on the question.",
        found: "Found",
        notRead: "found, not yet read",
        grounds: "Grounds",
        alternative: "Alternative considered",
        conditions: "Conditions",
        checked: "checked",
        verdict: "Your decision after checking: accept. Rejecting it or leaving it open would be just as possible.",
        linkedFrom: "Now linked from",
        finding: "Finding from the test",
        recordedIn: "Recorded in",
        compare: "Do the conditions hold?",
        asks: "asks about audio recordings.",
        informs: "The conditions do not hold, so the decision informs a new one instead of being replaced.",
      },
      actors: { you: "You", agent: "Assistant", both: "You and the assistant" },
      phases: {
        question: ["Ask", "You bring a question from a project.", "Which file format should the photo archive keep its masters in?"],
        recover: ["Find", "The assistant enters at HOME and the overview pages, like the keyword register of a card index, and follows links to earlier notes and their sources.", "It finds the notes on archival masters and file formats, the scan protocol and the FAIR principles for reusable data."],
        propose: ["Propose", "It drafts a note that records the decision with its reasons.", "Uncompressed TIFF for masters, JPEG for access copies, and the rejected alternative."],
        decide: ["Decide", "You check the sources, check the reasoning and then accept, reject or leave it.", "You compare the proposal with the notes it cites and accept it."],
        incorporate: ["File it", "Every statement has one place. The note gets its place, and the notes that point to it are brought up to date.", "The overview page and the project overview now link the decision."],
        test: ["Test the result", "What the project builds, here the online presentation, is tested, and what the test shows goes back into the project's knowledge.", "The online presentation shows photographs without rights statements, so rights become a required field."],
        reuse: ["Reuse later", "Another project finds the decision and checks whether its conditions hold.", "The oral history project asks about audio. The decision covers still images only, so it informs a new decision instead of replacing it."],
      },
    },
    build: {
      title: "Build your own vault",
      tools: [
        ["Obsidian", "free", LINKS.obsidian],
        ["Claude Code or Codex", "paid plan or account", LINKS.claudeCode],
        ["Docling", "free, runs locally", LINKS.docling],
        ["Git and Python", "free, only for the checks in step 7", LINKS.git],
      ],
      toolsLabel: "You need",
      copy: "Copy", copied: "Copied", copyFailed: "Copying failed, please select the text",
      steps: [
        { title: "Create a vault and connect the assistant", body: "Install Obsidian and open an empty folder with “Open folder as vault”. Install Claude Code, whose desktop app needs no terminal, or Codex, and open the same folder in it. You type requests in its chat and accept or reject what it proposes.", prompt: "Read this folder and tell me in three sentences what you can do here.", added: "An empty vault, with the assistant working in it.", links: [["Obsidian", LINKS.obsidian], ["Claude Code", LINKS.claudeCode], ["Codex", LINKS.codex]] },
        { title: "Bring your sources into Markdown", body: "Docling turns PDFs, slides and documents into Markdown on your computer, and the assistant can install and run it for you. Keep the originals and leave the converted text as it is. Where a statement must be traceable to the exact passage in its source, the method Grounded Vault adds that proof.", prompt: "Convert the files in [folder] with Docling into Markdown in the folder Sources/. Do not edit the converted text. List pages where tables or scans came out wrong.", added: "Your sources as Markdown files, not yet connected.", links: [["Docling", LINKS.docling], ["Grounded Vault", LINKS.groundedVault]] },
        { title: "Think through your structure", body: "How do you work? Write down your projects, fields of knowledge, proposals, administration and where your to-dos live. This is your thinking, not the assistant's.", prompt: "My projects: …\nMy fields of knowledge: …\nRecurring work (proposals, administration, teaching): …\nWhere my to-dos should live: …", added: "A sketch of your structure." },
        { title: "Talk it through with the assistant", body: "Let the assistant ask about gaps and overlaps before anything is created.", prompt: "Here is how I work: [your sketch]. Ask me up to five questions about gaps and overlaps, then propose a folder structure. Do not create anything yet.", added: "A structure you have both checked." },
        { title: "Let the assistant build it", body: "The assistant creates the folders, the start page HOME and the work list ACTIVE-WORK, and writes the structure into CLAUDE.md, which it reads at the start of every session. The template also brings the procedures, called skills, that later steps use. These written rules are the vault's governance. Open questions to you go into ACTIVE-WORK, phrased so you can answer them without looking anything up.", prompt: "Use the Second Brain Vault template (github.com/chpollin/second-brain-vault) as the model. Create the structure we agreed on, write it as the topography in CLAUDE.md, put my to-dos into ACTIVE-WORK and show me the result.", added: "Your structure, with CLAUDE.md as the map for the assistant.", links: [["Template", LINKS.template]] },
        { title: "Work in your knowledge", body: "Take one project and turn its sources into small notes, one per concept, each linked to its source and the project. What belongs to one project only stays with that project, and the vault links to it.", prompt: "For [project], turn the relevant files in Sources/ into concept and literature notes with the skill vault-knowledge. One note per concept, linked to its source and the project overview. Show me the list before writing.", added: "Notes connected to sources and projects." },
        { title: "Make it findable for the assistant", body: "The assistant finds files by searching names and text and by following links, not through an index. So give every field an overview page, a map of content, that lists its notes, and keep names unique.", prompt: "Create an overview page (MOC) for each field with one line per note, link it from HOME and report notes that no overview page reaches.", added: "Overview pages that tie the vault together." },
      ],
    },
    notes: {
      title: "Good to know",
      dataTitle: "Your data",
      data: [
        ["Your notes stay on your computer, and Obsidian needs no account.", LINKS.obsidianPricing],
        ["Docling converts your sources locally and sends nothing away.", LINKS.docling],
        ["The assistant sends your requests and the notes it reads to its provider, not the whole folder. Whether these may be used for training depends on provider and plan.", LINKS.claudeData],
        ["For confidential material, follow your organisation's rules or keep it out of the vault.", ""],
      ],
      careTitle: "Keeping it alive",
      care: [
        "New sources and insights become notes or extend existing ones.",
        "ACTIVE-WORK holds the current state and the open questions to you.",
        "Duplicates are merged once nothing would be lost.",
        "A regular review reports broken links, unreachable notes and outdated copies, and Git keeps every earlier state.",
      ],
      source: "source",
    },
    reference: {
      title: "Technical reference",
      summary: "The template's files, rules and procedures",
      treeLabel: "Files of the template",
      example: "example",
      tree: [
        ["CLAUDE.md", "map and rules, read every session", "CLAUDE.md"],
        ["HOME.md", "start page", "HOME.md"],
        ["ACTIVE-WORK.md", "work state, questions to you", "ACTIVE-WORK.md"],
        ["VAULT-OPERATIONS.md", "tasks, procedures, glossary", "VAULT-OPERATIONS.md"],
        ["TAG-TAXONOMY.md", "permitted tags", "TAG-TAXONOMY.md"],
        ["<Field>/", "notes and one overview page", "", true],
        ["Literature/", "one note per source", "", true],
        ["Projects/", "one overview per project", "", true],
        ["Writing/", "your own texts", ""],
        ["Vault Operations/", "conventions, templates, decision log", "Vault Operations/Decision Log.md"],
        [".claude/rules/", "rules by file path", ".claude/rules/documents.md"],
        [".claude/skills/", "procedures", ""],
        ["scripts/", "checks", "scripts/check_vault.py"],
      ],
      governance: "Hard rules refuse a change, measured rules produce a to-do list, everything else is judgement during review. Why a rule holds stands in the decision log. Switch the checks on with git config core.hooksPath scripts/hooks.",
      proceduresLabel: "Procedures",
      procedures: [
        ["vault-knowledge", "add, check, merge notes"],
        ["vault-audit", "check the whole vault"],
        ["vault-distill", "outline without changing"],
        ["active-work-report", "report the work state"],
        ["project-knowledge", "work from a project"],
        ["vault-orient", "read from another project"],
      ],
      extras: [
        ["A personal research persona is optional. The procedure persona-init builds it from your notes, and ordinary vault work does not need it.", ".claude/skills/persona-init/SKILL.md", "persona-init"],
        ["Several agents can review in parallel. They only read, and the vault session alone writes and accepts their findings.", "Vault Operations/Conventions/Convention Curation Round.md", "Convention Curation Round"],
      ],
      types: "Document types are concept, literature, knowledge, research, specification and vault-organisation, defined in",
      typesLink: "Convention Frontmatter Field Profiles",
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
    nav: { top: "Idee", build: "Aufbauen", notes: "Gut zu wissen", reference: "Referenz" },
    template: "Vorlage auf GitHub",
    hero: {
      title: "Second Brain Vault",
      lead: "Ein Second Brain Vault ist ein Ordner verbundener Textnotizen auf deinem eigenen Rechner, in dem frühere Überlegungen mit ihren Gründen auffindbar bleiben.",
      flow: [["Textdateien", "auf deinem Rechner"], ["Obsidian", "zeigt die Verweise"], ["KI-Assistent", "findet und schlägt vor"], ["Du", "entscheidest"]],
      who: "Für Menschen in Forschung, Institutionen und Unternehmen, die projektübergreifend mit Wissen arbeiten. Programmieren musst du nicht.",
      build: "So baust du deinen eigenen",
    },
    graph: {
      label: "Wissensgraph eines Beispiel-Vaults",
      groups: {
        concept: "Begriffsnotiz", moc: "Übersichtsseite (Map of Content)", literature: "Literaturnotiz", project: "Projektübersicht", source: "In Markdown umgewandelte Quelle",
        core: "Regeln für den KI-Assistenten, in jeder Sitzung zuerst gelesen", control: "Steuerdokument des Vaults", rule: "Regel oder Konvention",
        skill: "Skill, ein beschriebener Ablauf für eine Aufgabe", operations: "Betrieb des Vaults", check: "Automatische Prüfung",
      },
      legend: { source: "Quellen", concept: "Begriffe", moc: "Übersichtsseiten", literature: "Literatur", project: "Projekte", system: "Regeln für den Assistenten" },
    },
    episode: {
      title: "Beispiel: ein Team und sein Fotoarchiv",
      play: "Abspielen", pause: "Anhalten", prev: "Zurück", next: "Weiter",
      stepOf: (n, total) => `${n} von ${total}`,
      stepLabel: (n, total, name, actor, state) => `Schritt ${n} von ${total}: ${name}, ${actor}, ${state}`,
      stepStates: { done: "erledigt", current: "aktueller Schritt", next: "folgt" },
      noteStates: { asked: "hier entsteht die Frage", read: "gelesen", found: "gefunden, noch nicht gelesen", proposal: "Vorschlag", checked: "von dir geprüft", accepted: "angenommen", updated: "nachgeführt" },
      badges: { proposal: "Vorschlag des Assistenten", decide: "Du entscheidest", accepted: "Von dir angenommen", conditions: "Bedingungen weichen ab" },
      legend: "Gelb: hier entsteht die Frage. Blau: gelesen, gefüllt, wenn du sie geprüft hast. Gestrichelt: gefunden, ungelesen. Pink: Vorschlag und genutzte Verweise. Grün: angenommen oder nachgeführt. Klicke eine Notiz an, um sie zu lesen.",
      involved: "Notizen in diesem Schritt",
      card: {
        label: "Die Notiz des Beispiels",
        noNote: "Noch keine Notiz",
        askedIn: "Gefragt in",
        lookFirst: "Bevor etwas Neues entsteht, sucht der Assistent, was der Vault zu der Frage schon enthält.",
        found: "Gefunden",
        notRead: "gefunden, noch nicht gelesen",
        grounds: "Gründe",
        alternative: "Verworfene Alternative",
        conditions: "Bedingungen",
        checked: "geprüft",
        verdict: "Deine Entscheidung nach der Prüfung: annehmen. Ablehnen oder offen lassen wäre ebenso möglich.",
        linkedFrom: "Jetzt verlinkt von",
        finding: "Befund aus der Prüfung",
        recordedIn: "Festgehalten in",
        compare: "Gelten die Bedingungen?",
        translated: "Übersetzt aus der englischen Beispielnotiz.",
        asks: "fragt nach Tonaufnahmen.",
        informs: "Die Bedingungen gelten nicht, also informiert die Entscheidung eine neue, statt ersetzt zu werden.",
      },
      // German rendering of the English example note docs/example/Data Management/Decision Image
      // Master Format.md, by section. The note file stays the source; change both together.
      note: {
        Decision: "Archivmaster von Fotografien werden als unkomprimiertes TIFF aufbewahrt. Nutzungskopien sind JPEG.",
        Grounds: [
          "- Ein [[Archival Master]] bewahrt die volle Information des Scans, und eine [[Access Copy]] lässt sich daraus jederzeit erzeugen.",
          "- TIFF ist offen dokumentiert und weithin lesbar, siehe [[File Format]].",
          "- Der Scanner liefert unkomprimiertes TIFF ohne Verlust, siehe [[Scan Protocol 2025]].",
        ].join("\n"),
        "Alternative considered": "Nur hochwertige JPEG-Dateien zu behalten wurde verworfen, weil jedes erneute Speichern Information verliert.",
        Conditions: "Die Entscheidung gilt für Standbilder des Fotoarchivs. Audio, Video und Text brauchen eine eigene Entscheidung.",
      },
      actors: { you: "Du", agent: "Assistent", both: "Du und der Assistent" },
      phases: {
        question: ["Fragen", "Du bringst eine Frage aus einem Projekt mit.", "In welchem Dateiformat soll das Fotoarchiv seine Master aufbewahren?"],
        recover: ["Finden", "Der Assistent steigt bei HOME und den Übersichtsseiten ein, wie beim Schlagwortregister eines Zettelkastens, und folgt Verweisen zu früheren Notizen und ihren Quellen.", "Er findet die Notizen zu Archivmastern und Dateiformaten, das Scanprotokoll und die FAIR-Prinzipien für nachnutzbare Daten."],
        propose: ["Vorschlagen", "Er entwirft eine Notiz, die die Entscheidung mit ihren Gründen festhält.", "Unkomprimiertes TIFF für Master, JPEG für Nutzungskopien, dazu die verworfene Alternative."],
        decide: ["Entscheiden", "Du prüfst die Quellen, prüfst die Begründung und nimmst an, lehnst ab oder lässt es.", "Du vergleichst den Vorschlag mit den Notizen, auf die er sich stützt, und nimmst ihn an."],
        incorporate: ["Ablegen", "Jede Aussage hat einen Ort. Die Notiz bekommt ihren, und die Notizen, die auf sie verweisen, werden nachgeführt.", "Übersichtsseite und Projektübersicht verweisen jetzt auf die Entscheidung."],
        test: ["Ergebnis prüfen", "Was das Projekt baut, hier die Online-Präsentation, wird geprüft, und was die Prüfung zeigt, geht ins Wissen des Projekts zurück.", "Die Online-Präsentation zeigt Fotos ohne Rechteangabe, also werden Rechte zum Pflichtfeld."],
        reuse: ["Wiederverwenden", "Ein anderes Projekt findet die Entscheidung und prüft, ob ihre Bedingungen gelten.", "Das Oral-History-Projekt fragt nach Audio. Die Entscheidung gilt nur für Standbilder, sie informiert also eine neue Entscheidung, statt sie zu ersetzen."],
      },
    },
    build: {
      title: "Den eigenen Vault aufbauen",
      tools: [
        ["Obsidian", "kostenlos", LINKS.obsidian],
        ["Claude Code oder Codex", "bezahlter Plan oder Konto", LINKS.claudeCode],
        ["Docling", "kostenlos, läuft lokal", LINKS.docling],
        ["Git und Python", "kostenlos, erst für die Prüfungen in Schritt 7", LINKS.git],
      ],
      toolsLabel: "Du brauchst",
      copy: "Kopieren", copied: "Kopiert", copyFailed: "Kopieren nicht möglich, Text bitte markieren",
      steps: [
        { title: "Vault anlegen und Assistenten verbinden", body: "Installiere Obsidian und öffne einen leeren Ordner mit „Ordner als Vault öffnen“. Installiere Claude Code, dessen Desktop-App kein Terminal braucht, oder Codex und öffne denselben Ordner darin. Du schreibst deine Anfragen in den Chat und nimmst seine Vorschläge an oder lehnst sie ab.", prompt: "Lies diesen Ordner und sag mir in drei Sätzen, was du hier tun kannst.", added: "Ein leerer Vault, in dem der Assistent arbeitet.", links: [["Obsidian", LINKS.obsidian], ["Claude Code", LINKS.claudeCode], ["Codex", LINKS.codex]] },
        { title: "Quellen in Markdown bringen", body: "Docling macht aus PDFs, Folien und Dokumenten Markdown, direkt auf deinem Rechner, und der Assistent kann es für dich installieren und ausführen. Behalte die Originale und lass den umgewandelten Text unverändert. Wo eine Aussage bis zur genauen Stelle in ihrer Quelle belegbar sein muss, ergänzt die Methode Grounded Vault diesen Nachweis.", prompt: "Wandle die Dateien in [Ordner] mit Docling in Markdown im Ordner Sources/ um. Bearbeite den umgewandelten Text nicht. Nenne Seiten, bei denen Tabellen oder Scans fehlerhaft herausgekommen sind.", added: "Deine Quellen als Markdown-Dateien, noch unverbunden.", links: [["Docling", LINKS.docling], ["Grounded Vault", LINKS.groundedVault]] },
        { title: "Die eigene Struktur überlegen", body: "Wie arbeitest du? Schreib deine Projekte, Wissensgebiete, Anträge, Verwaltung auf und wo deine To-dos leben sollen. Das ist deine Denkarbeit, nicht die des Assistenten.", prompt: "Meine Projekte: …\nMeine Wissensgebiete: …\nWiederkehrende Arbeit (Anträge, Verwaltung, Lehre): …\nWo meine To-dos leben sollen: …", added: "Eine Skizze deiner Struktur." },
        { title: "Mit dem Assistenten durchgehen", body: "Lass den Assistenten nach Lücken und Überschneidungen fragen, bevor etwas angelegt wird.", prompt: "So arbeite ich: [deine Skizze]. Stell mir bis zu fünf Fragen zu Lücken und Überschneidungen und schlag dann eine Ordnerstruktur vor. Leg noch nichts an.", added: "Eine Struktur, die ihr beide geprüft habt." },
        { title: "Vom Assistenten aufbauen lassen", body: "Der Assistent legt die Ordner, die Startseite HOME und die Arbeitsliste ACTIVE-WORK an und schreibt die Struktur in CLAUDE.md, die er zu Beginn jeder Sitzung liest. Die Vorlage bringt auch die beschriebenen Abläufe, Skills genannt, mit, die spätere Schritte nutzen. Diese geschriebenen Regeln sind die Governance des Vaults. Offene Fragen an dich kommen in ACTIVE-WORK, so formuliert, dass du sie ohne Nachlesen beantworten kannst.", prompt: "Nimm die Vorlage Second Brain Vault (github.com/chpollin/second-brain-vault) als Muster. Leg die vereinbarte Struktur an, schreib sie als Topografie in CLAUDE.md, trag meine To-dos in ACTIVE-WORK ein und zeig mir das Ergebnis.", added: "Deine Struktur, mit CLAUDE.md als Landkarte für den Assistenten.", links: [["Vorlage", LINKS.template]] },
        { title: "Wissen einarbeiten", body: "Nimm ein Projekt und mach aus seinen Quellen kleine Notizen, eine pro Begriff, jede verbunden mit ihrer Quelle und dem Projekt. Was nur zu einem Projekt gehört, bleibt beim Projekt, und der Vault verweist darauf.", prompt: "Mach für [Projekt] aus den passenden Dateien in Sources/ Begriffs- und Literaturnotizen mit dem Skill vault-knowledge. Je Begriff eine Notiz, verbunden mit ihrer Quelle und der Projektübersicht. Zeig mir die Liste vor dem Schreiben.", added: "Notizen, verbunden mit Quellen und Projekten." },
        { title: "Für den Assistenten auffindbar machen", body: "Der Assistent findet Dateien, indem er nach Namen und Text sucht und Verweisen folgt, nicht über einen Index. Darum bekommt jedes Gebiet eine Übersichtsseite, eine Map of Content, die seine Notizen auflistet, und jede Notiz einen eindeutigen Namen.", prompt: "Leg für jedes Gebiet eine Übersichtsseite (MOC) mit einer Zeile pro Notiz an, verlinke sie von HOME aus und nenne Notizen, die keine Übersichtsseite erreicht.", added: "Übersichtsseiten, die den Vault zusammenhalten." },
      ],
    },
    notes: {
      title: "Gut zu wissen",
      dataTitle: "Deine Daten",
      data: [
        ["Deine Notizen bleiben auf deinem Rechner, und Obsidian braucht kein Konto.", LINKS.obsidianPricing],
        ["Docling wandelt deine Quellen lokal um und schickt nichts weg.", LINKS.docling],
        ["Der Assistent schickt deine Anfragen und die Notizen, die er liest, an seinen Anbieter, nicht den ganzen Ordner. Ob sie zum Training genutzt werden dürfen, hängt von Anbieter und Plan ab.", LINKS.claudeData],
        ["Für vertrauliches Material gelten die Regeln deiner Organisation, oder es bleibt außerhalb des Vaults.", ""],
      ],
      careTitle: "Lebendig halten",
      care: [
        "Neue Quellen und Einsichten werden zu Notizen oder ergänzen bestehende.",
        "ACTIVE-WORK hält den aktuellen Stand und die offenen Fragen an dich.",
        "Doppeltes wird zusammengeführt, sobald nichts verloren ginge.",
        "Eine regelmäßige Durchsicht meldet tote Verweise, unerreichbare Notizen und veraltete Kopien, und Git bewahrt jeden früheren Stand.",
      ],
      source: "Quelle",
    },
    reference: {
      title: "Technische Referenz",
      summary: "Dateien, Regeln und Abläufe der Vorlage",
      treeLabel: "Dateien der Vorlage",
      example: "Beispiel",
      tree: [
        ["CLAUDE.md", "Landkarte und Regeln, jede Sitzung gelesen", "CLAUDE.md"],
        ["HOME.md", "Startseite", "HOME.md"],
        ["ACTIVE-WORK.md", "Arbeitsstand, Fragen an dich", "ACTIVE-WORK.md"],
        ["VAULT-OPERATIONS.md", "Aufgaben, Abläufe, Glossar", "VAULT-OPERATIONS.md"],
        ["TAG-TAXONOMY.md", "erlaubte Tags", "TAG-TAXONOMY.md"],
        ["<Gebiet>/", "Notizen und eine Übersichtsseite", "", true],
        ["Literature/", "eine Notiz pro Quelle", "", true],
        ["Projects/", "eine Übersicht pro Projekt", "", true],
        ["Writing/", "deine eigenen Texte", ""],
        ["Vault Operations/", "Konventionen, Vorlagen, Decision Log", "Vault Operations/Decision Log.md"],
        [".claude/rules/", "Regeln nach Dateipfad", ".claude/rules/documents.md"],
        [".claude/skills/", "Abläufe", ""],
        ["scripts/", "Prüfungen", "scripts/check_vault.py"],
      ],
      governance: "Harte Regeln lehnen eine Änderung ab, gemessene erzeugen eine Arbeitsliste, alles andere ist Urteil bei der Durchsicht. Warum eine Regel gilt, steht im Decision Log. Die Prüfungen schaltest du mit git config core.hooksPath scripts/hooks ein.",
      proceduresLabel: "Abläufe",
      procedures: [
        ["vault-knowledge", "Notizen ergänzen, prüfen, zusammenführen"],
        ["vault-audit", "den ganzen Vault prüfen"],
        ["vault-distill", "Gliederung ohne Änderung"],
        ["active-work-report", "Arbeitsstand berichten"],
        ["project-knowledge", "aus einem Projekt arbeiten"],
        ["vault-orient", "aus einem anderen Projekt lesen"],
      ],
      extras: [
        ["Eine persönliche Forschungspersona ist optional. Der Ablauf persona-init baut sie aus deinen Notizen, für die normale Arbeit im Vault braucht es sie nicht.", ".claude/skills/persona-init/SKILL.md", "persona-init"],
        ["Mehrere Agenten können parallel prüfen. Sie lesen nur, schreiben und übernehmen darf allein die Vault-Sitzung.", "Vault Operations/Conventions/Convention Curation Round.md", "Convention Curation Round"],
      ],
      types: "Dokumenttypen sind concept, literature, knowledge, research, specification und vault-organisation, festgelegt in",
      typesLink: "Convention Frontmatter Field Profiles",
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
