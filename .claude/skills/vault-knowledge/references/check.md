# check

Structural and formal quality of one document, a folder or a glob, measured against the conventions in force for its document class, with neighbouring documents as context for placement.

The object of a run is a document, a folder, or a glob pattern.

## Steps

1. Determine the object and its document class. Project documents keep their own structure, and a `knowledge/` folder in a repository follows its own convention.
2. Read the relevant neighbours for term demarcation, placement and cross references. The yardstick is the convention, never the neighbours. A deviation shared by several neighbours is reported as a holdings or rule problem and establishes no new norm.
3. Run `python scripts/check_vault.py` first, with `--fixtures` when the object lies in the fixture folder. What the script decides and what it leaves open stands under Verification in SKILL.md. The own check assesses its findings and covers the rest, meaning the field profile of the type, the fit of the class, the quality of links and sources, and the prose.
4. A neighbour that carries a statement of the object in a divergent state is a finding with both locations. Its repair belongs to the refactor mode.
5. Formulate steps, meaning per document a numbered list of concrete steps with target values, plus patterns across all documents and observations without immediate action.
6. Unambiguous link repairs covered by an implementation order are executed and re-checked with `python scripts/check_vault.py --integrity`. Ambiguous targets are reported. Content and maturity status are preserved.

## Output

Numbered findings per document with target value, cross-document patterns, observations without action, and the verification actually run.
