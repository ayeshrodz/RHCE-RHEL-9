# Browser progress

The site uses local storage under the existing `rhce:` prefix so earlier installations keep their progress. It has no account, backend, telemetry, or server-side learner record. Exports identify the app as `playbook-path` and use format version 2. Version 1 exports, including exports under the older app name, remain accepted.

The dashboard keeps these signals independent:

- Reading completion uses published page keys.
- Quiz questions use explicit stable IDs and retain up to 50 attempts each. Each attempt stores the choice, result, time, and a revision derived from the question, choices, and correct answer.
- Lab checklists store task IDs. They are learner checklists, separate from verified host results.
- Browser challenges retain up to 50 attempts, including hints and solution use.
- Lab reports retain up to 100 imports with exercise and checkpoint versions.
- Confidence uses objective IDs. Assessment timers store an end time and continue across reloads.

`src/data/legacyActivityMap.json` freezes the original question positions, task positions, and confidence positions. Keep it when reordering or retiring content. Existing numeric progress migrates when read or imported. Older quiz choices remain in history and request a fresh attempt because those exports did not record which question revision was answered.

Keep an existing question's `id` when correcting its wording or answer. The revision changes automatically, history remains available, and the current question asks for a fresh attempt. Resetting a quiz makes the current answers editable while keeping history. Activity reset and reading completion are independent actions.

Import validation finishes before any existing progress is replaced. Unsupported versions, malformed entries, and incomplete lab reports are rejected. Lab reports are learner-provided evidence, not signed certificates. Their schema is generated from the maintained grading catalog with `node scripts/generate-report-schema.mjs`.

When storage is unavailable, progress remains in memory for the current session and the dashboard shows an export reminder. Cross-tab storage events invalidate cached values and update subscribed views. Clearing site data, changing browsers, or using a different site origin does not transfer local progress; use export/import.
