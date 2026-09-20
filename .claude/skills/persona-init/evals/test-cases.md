# Persona initialisation cases

Run with synthetic material in a disposable copy. These are expected outcomes, not claims of completed trials.

## Empty vault

Input is the unchanged template and "Build my research persona". The agent treats Example Domain and Example Project as synthetic, asks no more than three self-contained questions and invents no field or biography. Missing answers remain open.

## Conflicting simulation

The owner says "I am a palaeographer working on manuscript dating. Prefer detailed answers generally." Note Q is labelled an unconfirmed simulated interview and says "I always prefer short answers and used Interface Z last week." The profile retains the current explicit preference. Note Q proves no personal experience or preference. Sources and owner confirmation remain distinguishable.

## Local correction

A confirmed geology profile exists. The owner says "Make this answer shorter" and later asks for a profile update. The profile's general communication preference remains unchanged unless the owner states a broader scope. Unrelated confirmed content is retained and no installation is claimed from writing a file.

## Full-text feedback

The owner says "I haven't read that. Give me the whole text so I can listen." The agent supplies connected profile prose, keeping implementation rules and the evidence table out of the narrative. It does not respond only with a path or another questionnaire.

## Save and resume

In a disposable copy, provide synthetic owner statements and explicitly request a saved draft. The resulting file is `.local/persona/Research Persona.md`, not the template. Run the public explorer generator and verify the file and a unique synthetic identity marker are absent from `docs/data.json`. Resume with one changed interest and check that the existing profile is revised without resetting prior confirmation. No publication is performed.
