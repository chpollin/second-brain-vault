---
type: knowledge
created: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-skills, skill, skill-md, description, invariants, test-cases]
---

# Convention Skills

## Trigger

Consult before adding or changing a skill under `.claude/skills/`.

## What a skill is

A skill is an executable procedure. It reads vault knowledge and never duplicates it. What must hold for every document belongs in a rules file, because a rules file loads by path, while a maintenance skill only runs when it is called.

## Cut

One skill covers one coherent class of tasks and names its triggers. Ways of working that share the same invariants form one skill with modes. The shared rules stand once in `SKILL.md`, and each mode is its own file under `references/`, linked directly from `SKILL.md` and one level deep.[^bp] Separate skills with their own copies of the same rules drift apart.

## Content

- Only what an agent gets wrong without the skill. The best source for a load-bearing sentence is a rejected result.
- What a formatter, linter or script decides without judgement stands in its configuration or as a script. The skill says whether to run it.[^bp]
- The degree of freedom follows the fragility of the task. An error-prone operation gets the exact command, a question of judgement gets criteria.[^bp]
- No time-bound statements, and one word per thing.[^bp]
- Rule values stand at their place of maintenance and are referenced. A pointer replaces a rule only when the rule really stands at the target. Check the target before removing the copy.
- The language of the instructions and the language of the governed text are two decisions. A style skill for prose in another language keeps its contrast examples in that language.
- `SKILL.md` stays under five hundred lines.[^bp]

## Structure of SKILL.md

1. Frontmatter with `name` and `description`. The description is written in the third person, stays under 1024 characters and says what the skill does, when it fires, when it does not fire and which skill is then responsible.[^bp]
2. The purpose in one sentence.
3. `## Reads` names the knowledge sources with their paths. When a source cannot be read, the skill reports that and marks its result as unverified.
4. `## Procedure` as numbered steps, with a pointer to the file of each mode.
5. `## Invariants`, in a skill with modes, holds what applies in every mode.
6. `## Boundaries` names what the skill never touches and references [[Convention Curation Round#Write boundaries]].
7. `## Verification` names the checks as commands and demands a statement of what was checked and what was not.
8. `## Output` fixes the form of the result.

## Testing

A skill is written against observed failures. Before writing, the task runs without the skill and the concrete failures are recorded. From them come at least three test cases with expected behaviour under `evals/`.[^bp] The synthetic documents under [[Fixtures]] serve as a risk-free test field. A skill that carries a judgement of taste is judged by the operator on the result.

## Related

- [[VAULT-OPERATIONS#Skill register]]
- [[Convention Curation Round]]

[^bp]: Anthropic. Skill authoring best practices. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices, accessed 2026-09-19. Vendor guidance without measurement.
