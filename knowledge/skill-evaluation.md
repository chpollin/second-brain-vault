# Skill evaluation

## Scope

The local evaluation of 2026-09-19 covered the seven template skills with bounded synthetic tasks. The main instance integrated findings from three delegated evaluators and inspected the relevant files and outputs. These are development checks, not independent expert acceptance or a controlled comparison with agents working without skills. No personal research content was used in the trials.

The source template was preserved during behavioural trials. Writing trials ran in disposable copies or synthetic repositories. Expected behaviour lives under each skill's `evals/test-cases.md`; those specifications are not run results. The final instruction files were also checked with the skill-creator validator.

## Observed tasks

| Skill | Executed tasks and observations | Remaining scope |
|---|---|---|
| vault-knowledge | All five modes were applied in a disposable copy. The evaluator identified stale restatements and internal conflict, corrected a link and a glossary, enriched Beta with supplied fictional protocol documents and integrated a new Replay Check concept. A renamed working handoff was dissolved after preserving its exclusive claim as empirically unverified. A protected incoming manuscript link blocked deletion in another case. | Supplied synthetic sources exercise integration. Scholarly web retrieval and correctness of real research claims were not tested. |
| vault-audit | The unchanged copy had no regular findings. The explicit fixture run reported its seeded invalid tag and dead anchor. Removing the taxonomy in another isolated state caused configuration failure with exit code 2. Hash comparison confirmed that read-only audit commands changed no inspected source files. | Semantic judgements and larger ambiguous link graphs are not validated by the checker. |
| vault-orient | Selective navigation located the example concept through HOME and its MOC. Placeholder repository references were reported as unverified. A follow-up applied the clarified external entry rule without writing. | The follow-up reused an informed evaluator and was not a cold-start experiment. |
| vault-distill | An Alpha outline retained all documented causes and their fictional status. A comparison preserved Beta's internal conflict and unresolved citation differences. A follow-up requested writing without a depth and correctly used deep reading with prose output. | Live scholarly research and broader synthesis quality remain untested. |
| project-knowledge | In a synthetic Git repository, a TSV handoff was checked against code and integrated into the specification, project summary and journal. The resolved handoff was removed. Another trial preserved protected data and retained a claim whose purported JSON source was missing. Existing uncommitted draft content was preserved. | Larger repository migrations and independent expert acceptance were not tested. |
| active-work-report | A stale board was compared with its project source, done log and working tree. Completed work was distinguished from an unchecked draft. An unavailable repository remained unverified. The delegated read-only report preserved the board. The main instance then produced a separate synthetic authorized update, preserving the unanswered operator point and the unrelated entry and checking the required fields. | The authorized update was a controlled local example, not an end-user production session. |
| writing-style | English prose was produced from read fictional material. A rewrite preserved a substantive three-item list and numeric page ranges. The corrected connector example was exercised again without a comma splice. | The evaluator performed the self-check. Personal stylistic acceptance and independent language review remain open. |

The original fixture corpus intentionally remains defective. A fixture command returning a hard finding is the expected outcome for that corpus. In the edited knowledge trial, the dead anchor was repaired and the invalid fixture tag deliberately remained. The report does not claim that the repaired copy passed every fixture check.

## Persona initialisation trial

The later `persona-init` addition was checked separately on 2026-09-19. Before its instructions
were written, an agent handled three synthetic dialogue cases without the new skill. It
correctly treated the empty template as non-biographical, rejected an unconfirmed interview
simulation as evidence of a personal preference, and kept a request to shorten one answer
local to that answer. These baseline cases exposed no failure and support no improvement claim.

With the skill, the same agent then worked in an authorised disposable copy. A fictional
palaeographer supplied a field, page images and catalogue records as materials, a need to
compare dating arguments, and a general preference for detailed explanations. The agent
saved `.local/persona/Research Persona.md`, read it back and delivered a full narrative
profile. A second request added watermark comparison and asked for a shorter response.
The saved update retained the general detail preference and recorded brevity as local to
the response. The working agreement remained distinct from personal claims. The absence
of concrete manuscript evidence was recorded, and experience with the interface mentioned
only by the unconfirmed simulation was not invented.

The main instance inspected the saved file and the generated `docs/data.json`. The added
activity, retained preference and local scope were present in the file. The synthetic identity
marker and the private profile entry were absent from the explorer. `git check-ignore` also
resolved the default output to the existing `.local/` exclusion. Local trial evidence is
retained under `.local/persona-init-evaluation/`, outside the explorer.

The skill-creator validator accepted the new instruction file. The regenerated template
passed its structural check without hard or measured findings, its existing Python suite,
and the parent repository's evidence-chain check. The fixture check continued to report its
deliberately seeded defects. No new model runtime or global skill installation was created.
The trial is a development check with known expectations and the same evaluator for baseline
and skill use. It establishes neither independent behavioural reliability nor personal or
scholarly acceptance. Actual research-source retrieval and first-use behaviour across other
agent environments remain untested.

## Corrections integrated

- External orientation now permits its own read-only entry and reserves writing procedures for an authorized vault session.
- Synthesis defaults are independent for depth and output form. A writing request without a depth uses deep reading.
- An explicit operational update order no longer requires a second confirmation. Unanswered substantive decisions remain open.
- The English connector example uses two complete sentences, and the delivery rule permits its short verification note outside the deliverable.
- The knowledge skill no longer points to a nonexistent mass-retag pattern.
- Knowledge repairs and audit repairs account for the generated explorer before final verification. Read-only runs do not regenerate it.
- Six missing evaluation specifications were added. The knowledge cases now distinguish the original protected fixtures from disposable deletion trials and no longer invent a past session or a verified bibliographic source.

## Reproduction and evidence limits

These dated observations are retained as a development record. The public template does not
include the local trial artefacts or complete dialogue transcripts. Static checks during later
synchronization do not repeat or independently verify the behavioural trials. The retained
persona trial files record its final profile and checks, without a complete baseline dialogue.

The README removal procedure was checked in an isolated copy on 2026-09-19. Removing
`Convention Skills` and its constitution entry, then regenerating the derived files, left
dead inbound links and broke the test that names the convention as a known explorer file.
Updating those references and that component-specific assertion restored the full suite.
The README now includes dependent instructions, tests and generated data in the removal
procedure. Removing the required field-profile convention separately produced configuration
failure with exit code 2, so it is explicitly retained as a checker dependency.

The hard-only check originally emitted the fixture's dead-anchor finding as measured output.
A regression test failed on that behaviour before the correction and passed afterward.
The corrected commit hook ran successfully in the isolated copy with measured dead links
still present and printed only the hard tier. The full checker continued to report those
links. The unchanged fixture corpus continued to produce its expected tag violation and
dead anchor, and the hard-only fixture run retained the tag violation.

The first-session repair instruction now explicitly names the copied fixture corpus and
the test that asserts its original defects. The test remains unchanged during that teaching
trial. This wording was checked against the fixture-protection rule. A fresh agent execution
of the revised instruction remains untested, and the source fixtures were left intact.

Run from the template root:

```powershell
python scripts/build_site.py
python scripts/check_vault.py
python scripts/check_vault.py --integrity
python scripts/check_vault.py --fixtures
python -m pytest -q
```

The fixture command is expected to return exit code 1 with its seeded tag defect and to report the dead anchor. Configuration failure is exit code 2. The regular and integrity checks must be evaluated from their findings, not only their exit codes.

Local machine-readable evidence is retained under `.local/skill-evaluation/`, which is excluded from the explorer. It includes the audit command results, repository-probe assertions and the main instance's authorized-update result. The synthetic source/output examples explain the behavioural observations above. Some language-task evidence consists of the evaluator's recorded outputs and the main instance's comparison with the cited passages. No score for general skill quality is inferred from these examples.

Changes are local template maintenance. They do not install the revised skills into the personal research vault or publish a new template snapshot. The template's derivation scope remains in [template.md](template.md).
