# Component catalog

Every tag a page may use. This file is generated from `packages/schema/catalog/components.json`; do not edit it. Pages write a tag as `{% name attribute="value" %}…{% /name %}`, or `{% name … /%}` when it holds nothing. Attribute values are text in double quotes, numbers, `true`/`false`, or a list such as `["a", "b"]`.

[`assessment-timer`](#assessment-timer) · [`callout`](#callout) · [`card`](#card) · [`cards`](#cards) · [`column`](#column) · [`columns`](#columns) · [`diagram`](#diagram) · [`feature-grid`](#feature-grid) · [`flashcards`](#flashcards) · [`flow-map`](#flow-map) · [`glossary`](#glossary) · [`hero`](#hero) · [`kbd`](#kbd) · [`lab`](#lab) · [`lab-challenge`](#lab-challenge) · [`lab-finish`](#lab-finish) · [`lab-notes`](#lab-notes) · [`lab-setup`](#lab-setup) · [`lead`](#lead) · [`legacy-widget`](#legacy-widget) · [`objectives`](#objectives) · [`practice`](#practice) · [`program-cards`](#program-cards) · [`quiz`](#quiz) · [`reader-variables`](#reader-variables) · [`reveal`](#reveal) · [`starter-files`](#starter-files) · [`step`](#step) · [`steps`](#steps) · [`tab`](#tab) · [`tabs`](#tabs) · [`task`](#task) · [`term`](#term) · [`terminal-demo`](#terminal-demo) · [`variant`](#variant) · [`variant-group`](#variant-group) · [`variant-switch`](#variant-switch)

## assessment-timer

An optional countdown for a timed practice assessment; survives reloads.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string (id) | yes | Stable id; the end time is stored under it. |
| `minutes` | integer (5–480) (default `90`) |  | Length of the session. |

## callout

A highlighted note beside the main text.

**Where:** on its own lines · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `type` | `note`, `tip`, `important`, `warning`, `exam` (default `note`) |  | What kind of note it is; sets the icon and colour. |
| `title` | string (shortText) |  | Heading; defaults to the type name. |

## card

One card in a card grid, with a heading, an optional kicker and a tone.

**Where:** on its own lines · **Inside:** `cards` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `title` | string (shortText) | yes | Card heading. |
| `kicker` | string (shortText) |  | Small label above the heading. |
| `tone` | `gray`, `purple`, `teal`, `coral`, `pink`, `blue`, `green`, `amber`, `red` (default `gray`) |  | Colour ramp. |

## cards

A responsive grid of cards that stacks on small screens.

**Where:** on its own lines · **Holds:** only `card`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `cols` | `2`, `3` (default `2`) |  | Columns on wide screens. |

## column

One column in a two-column layout.

**Where:** on its own lines · **Inside:** `columns` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `title` | string (shortText) |  | Column heading. |
| `tone` | `gray`, `purple`, `teal`, `coral`, `pink`, `blue`, `green`, `amber`, `red` (default `gray`) |  | Colour ramp. |

## columns

Two side-by-side columns that stack on small screens.

**Where:** on its own lines · **Holds:** only `column`

## diagram

A diagram of boxes, groups and arrows. It can be static, let the reader select boxes to read an explanation, or step through a sequence.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/diagram.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the diagram in the page data. |

## feature-grid

A grid of short feature descriptions, each with an icon.

**Where:** on its own lines · **Inside:** `page` · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/feature-grid.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the items in the page data. |

## flashcards

A deck of flip cards for recall.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/flashcards.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the deck in the page data. |
| `title` | string (shortText) |  | Deck title. |

## flow-map

A responsive sequence of steps with an explanation panel.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/flow-map.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the flow in the page data. |
| `title` | string (shortText) |  | Diagram title. |
| `caption` | string (text) |  | Caption below. |

## glossary

A list of terms and definitions.

**Where:** on its own lines · **Holds:** only `term`

## hero

The opening block of a landing page: heading, short introduction, two buttons and an animated illustration.

**Where:** on its own lines · **Inside:** `page` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `eyebrow` | string (shortText) |  | Small line above the heading. |
| `title` | string (shortText) | yes | Main heading. Wrap one word in asterisks in the intro, not here; the heading is plain text. |
| `art` | `lab` (default `lab`) |  | Which illustration to show beside the text. |
| `primary` | string (id) |  | Id of the program the first button opens. |
| `primaryLabel` | string (shortText) |  | Text of the first button. |
| `secondaryLabel` | string (shortText) |  | Text of the second button, which scrolls to the program cards. |

## kbd

A keyboard key, such as Esc or Ctrl+C.

**Where:** inside a line of text · **Holds:** inline text

## lab

A hands-on exercise with tracked tasks, notes and an optional challenge brief.

**Where:** on its own lines · **Holds:** only `task`, `lab-notes`, `lab-challenge`, `lab-setup`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string (id) | yes | Stable id; task progress is stored under it. |
| `title` | string (shortText) | yes | Exercise title. |
| `exercise` | string (exerciseName) |  | The lab tools exercise name (`lab start NAME`). |
| `ownExercise` | boolean (default `false`) |  | The exercise exists only on this platform; there is no classroom equivalent. |
| `starter` | boolean (default `true`) |  | `lab start` creates a starter project. |
| `hosts` | string[] |  | Labels for the machines the exercise uses, such as 'workstation' or 'Ubuntu host'. |
| `outcomes` | string[] |  | What the learner will have done. |
| `objectives` | string[] |  | Objectives the exercise practises. |

## lab-challenge

The requirements brief shown in Challenge mode.

**Where:** on its own lines · **Inside:** `lab` · **Holds:** Markdown

## lab-finish

How to grade and finish an exercise with the lab tools.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `exercise` | string (exerciseName) | yes | Exercise name. |
| `grade` | boolean (default `false`) |  | Also show the grading command. |

## lab-notes

Prerequisites, verification and variations for an exercise.

**Where:** on its own lines · **Inside:** `lab` · **Holds:** Markdown

## lab-setup

Extra setup notes shown for one variant, such as the home lab.

**Where:** on its own lines · **Inside:** `lab` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `variant` | string (id) | yes | The variant these notes are for. |

## lead

The opening paragraph of a page, shown larger than body text.

**Where:** on its own lines · **Holds:** Markdown

## legacy-widget

A widget that predates the generic catalog. Available during the migration only. _Transitional: being replaced by generic components._

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/legacy-widget.schema.json` · **Replaced by:** `diagram`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `name` | one of the widget names in the catalog file | yes | The widget. |
| `ref` | string (dataRef) |  | Key of its data in the page data. |

## objectives

A boxed list of what the reader will be able to do after the page.

**Where:** on its own lines · **Holds:** Markdown

## practice

A chapter's practice questions, in the quiz format; attempts feed the learning dashboard.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/practice.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the practice set in the page data. |

## program-cards

A card for each program on the site, with its platform, status and the reader's progress.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

## quiz

A multiple-choice knowledge check with instant feedback.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/quiz.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string (id) (default `quiz`) |  | Stable id within the page; answers are stored under it. |
| `ref` | string (dataRef) | yes | Key of the question bank in the page data. |
| `title` | string (shortText) |  | Panel title. |
| `objectives` | string[] |  | Objectives the questions check. |

## reader-variables

A form for the reader's own values (declared in program.yml), substituted into code.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

## reveal

A collapsed section the reader opens on demand, such as a solution or hint.

**Where:** on its own lines · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `title` | string (shortText) (default `Show answer`) |  | The toggle label. |

## starter-files

Lists an exercise's starter files and lets the reader preview them.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `exercise` | string (exerciseName) | yes | Exercise name. |

## step

One numbered step of a procedure.

**Where:** on its own lines · **Inside:** `steps` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `title` | string (shortText) |  | Step heading. |

## steps

A numbered procedure made of step tags.

**Where:** on its own lines · **Holds:** only `step`

## tab

One view inside a tabs group, with its own label.

**Where:** on its own lines · **Inside:** `tabs` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `label` | string (shortText) | yes | Tab label. |

## tabs

Alternative views of the same idea; the reader picks one.

**Where:** on its own lines · **Holds:** only `tab`

## task

One tracked task in a hands-on exercise.

**Where:** on its own lines · **Inside:** `lab` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `id` | string (id) | yes | Stable task id; completion is stored under it. |
| `title` | string (shortText) | yes | Task title. |
| `legacyIndex` | integer (1–) |  | Position in the exercise before ids existed; used to keep old progress. |

## term

One glossary entry: a term and its definition.

**Where:** on its own lines · **Inside:** `glossary` · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `name` | string (shortText) | yes | The term. |

## terminal-demo

An animated terminal that types a few commands and shows their output once it scrolls into view.

**Where:** on its own lines · **Inside:** `page` · **Holds:** nothing (write it as `/%}`) · **Page data:** `ref` names an entry in the page's `.data.yml`, checked against `data/terminal-demo.schema.json`

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `ref` | string (dataRef) | yes | Key of the terminal lines in the page data. |

## variant

Instructions for one variant (declared in program.yml).

**Where:** on its own lines · **Holds:** Markdown

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `name` | string (id) | yes | Variant id from program.yml. |
| `title` | string (shortText) |  | Heading when shown inline. |

## variant-group

Alternative instructions for each variant; the reader sees the one they chose.

**Where:** on its own lines · **Holds:** only `variant`

## variant-switch

The control that switches between variants.

**Where:** on its own lines · **Holds:** nothing (write it as `/%}`)

| Attribute | Value | Required | Meaning |
| --- | --- | --- | --- |
| `label` | string (shortText) |  | Label before the switch. |

