# Authoring guide

How to add sections, diagrams and exercises so they match the rest of the guide.

## 1. How content is organised

The `content/` folder is the single source of truth. A Vite plugin (`plugins/content-manifest.js`) reads it and builds the navigation, so you never edit JavaScript to add material.

```
content/
  _course.yml                      site title, exam, RHEL / AAP / Ansible Core versions
  _platform.mdx                    text of the "RHEL 9.0" dialog in the header
  ch02-implementing-playbooks/
    _chapter.yml                   title, goal, objectives
    01-inventory.mdx               section 2.1
    02-lab-inventory.mdx           section 2.2
  ch03-managing-variables-and-facts/
    _chapter.yml                   status: planned + topics → shown as "coming soon"
```

- **Order** comes from the numeric filename prefix (`01-`, `02-`…).
- **URL slug** is the filename without its prefix: `03-configuration.mdx` → `#/ch02/configuration`. Renaming a file changes its URL and resets anyone's progress for that page, so avoid renaming published sections.
- **Section links** add the heading's id after a second `#`: `#/ch07/collections#where-collections-come-from`. Ids come from the heading text (lowercased, spaces to hyphens), so renaming an `##` or `###` heading breaks links people have shared to it. Every `##` and `###` heading gets a copy-link button automatically; link to another page's heading from MDX with `[text](#/ch00/page#heading-id)`.
- **Frontmatter** at the top of each `.mdx`:

  ```yaml
  ---
  title: Managing Ansible configuration files
  kind: lesson        # lesson | lab | quiz | summary (inferred from the filename if omitted)
  minutes: 8         # estimated from word count if omitted
  draft: true         # optional: hide the section from the site
  ---
  ```

- **A new chapter**: create `content/chNN-name/` with a `_chapter.yml`. Once it contains `.mdx` files and has no `status: planned`, it becomes a normal chapter.

While `npm run dev` is running, everything updates live. Body edits hot-reload in place; adding, removing or renaming files, or changing frontmatter and `_chapter.yml`, reloads the page with the new navigation.

The page title, number, breadcrumb, reading time, table of contents, "mark complete" button and previous/next links are generated. **Do not** put an `# H1` in the MDX file.

## 2. Page shape

Aim for 5–12 minutes: purpose, a small example, an activity, an explanation, and a short recap. Put deeper details in optional reveals. A lesson can start like this:

```mdx
<Lead>One or two sentences on why this matters.</Lead>

<Objectives>
- Three or four things the reader will be able to do.
</Objectives>

## First topic
...prose, a diagram, a code block...

<Quiz id="check" objectives={["ch02.playbooks"]} questions={[ ... ]} />
```

Use `##` for topics and `###` for sub-topics; both appear in the table of contents.

## 3. Writing style

- **Write in your own words, from open sources:** the public exam objectives, the Ansible and RHEL documentation, and your own testing on the lab. Do not copy or closely paraphrase training materials or books. Commands, file contents and directive names are fine to reproduce.
- Short sentences, second person ("you"), active voice. Explain *why* before *how*.
- Use the classroom host names (`workstation`, `servera`–`serverd`, `utility.lab.example.com`) and documentation IP ranges (`192.0.2.0/24`). Never real personal hosts, users or addresses.
- Always use FQCNs in examples (`ansible.builtin.copy`).
- Only state exam facts you can back up. Phrase advice as practice habits, not as claims about how the exam is graded.

## 4. Components available in MDX

No imports needed. They are registered in `src/components/mdx/index.jsx`.

| Component | Use |
| --- | --- |
| `<Lead>` | Opening paragraph, larger text. |
| `<Objectives>` | "In this section" box. Put a Markdown list inside. |
| `<Callout type="note|tip|important|warning|exam" title="…">` | Asides. `exam` is for exam-specific advice. |
| `<Cards cols={2|3}>` + `<Card title kicker tone>` | Side-by-side comparisons. |
| `<Columns>` + `<Column title tone>` | Two-column contrasts (bad vs good). |
| `<Tabs>` + `<Tab label>` | Alternatives, for example file templates. |
| `<Steps>` + `<Step title>` | Numbered procedures inside a lesson. |
| `<Glossary>` + `<Term name>` | Definition lists. |
| `<Reveal title="Show solution">` | Hidden answers. |
| `<Quiz id objectives questions={[{ id, q, options, answer, explain, code? }]}>` | Multiple choice. One question renders as a compact "quick check". |
| `<Lab id objectives title outcomes hosts classroom>` + `<Task id title>` | Exercises with persisted checkboxes. `Task` must be a direct child of `Lab`. |
| `<Flashcards cards={[{ front, back }]}>` | Revision cards. |

Strings passed as props (quiz text, card text) support `` `code` ``, `**bold**` and `*italic*`.

`tone` is one of `purple`, `teal`, `coral`, `pink`, `gray`, `blue`, `green`, `amber`, `red`.

### Code blocks

````mdx
```yaml title="site.yml"
- name: Example
```
````

- `title="…"` shows a filename in the header.
- `console` blocks render as a terminal; their copy button copies only the commands, without prompts or output.
- `text` is for command output.
- Add `# [!code highlight]` at the end of a line to highlight it.

### MDX gotchas

- Keep fenced code blocks at column 0, even inside components.
- MDX **dedents multi-line template literals** inside JSX props. For multi-line strings (such as YAML for `AnnotatedYaml`), declare them with `export const` at the top of the file and pass the variable in.
- `{` and `<` in prose are JSX. Put them in inline code or escape them.

## 5. Diagrams

Diagrams are React components that draw SVG with the kit in `src/diagrams/kit`. They share one visual language: flat pastel boxes, hairline borders, 14px titles, 12px subtitles, thin grey arrows, and a `680`-wide coordinate space that scales to fit.

```jsx
import { Arrow, Diagram, Group, Node } from '../kit';

export default function Example() {
  return (
    <Diagram height={200} title="Accessible description" caption="Shown under the figure.">
      <Group x={10} y={10} w={300} h={180} tone="gray" label="Control node" />
      <Node x={30} y={50} w={140} h={56} tone="purple" title="site.yml" sub="desired state" />
      <Arrow points={[[170, 78], [240, 78]]} label="runs" />
    </Diagram>
  );
}
```

- **`Node`** takes `tone`, `title`, `sub` (string or array of lines), `mono`, `align="start"`, and for interactive diagrams `onClick`, `active` and `dim`.
- **`Arrow`** takes a list of points; corners are rounded automatically. Options: `label`, `labelAt`, `labelDx`, `labelDy`, `dashed`, `hot` (accent colour), `dim`.
- **`Group`** is a dashed container; `solid` makes it solid.
- **`InfoPanel`** (pass it through `below`) explains the selected node in clickable diagrams.
- **`useStepper` + `StepControls`** build step-through diagrams (see `TaskLifecycle`).

Colours come from CSS variables, so every diagram switches to dark mode automatically. Never hard-code colours in a diagram.

Export new diagrams from `src/diagrams/chNN/index.js`, and they become available in MDX automatically (the build plugin discovers `export { default as Name }` entries and loads the chapter only when a widget renders). Put a chapter's widget styles in `src/diagrams/chNN/chNN.css` and import it from that `index.js`.

Reusable pieces from chapter 3 that later chapters can use directly in MDX: `<ProjectTree paths={[...]} locked={[...]} notes={{...}} />` for directory layouts, and `<DataExplorer name="x" data={...} />` for any nested variable or JSON result.

### Lab placeholders

Write per-reader values as `<HOST_LAN_IP>`, `<HOST_USER>` or `<ROUTER_IP>` inside code blocks or inline code. They are highlighted, and replaced with the reader's own values once entered in the `<LabValues />` form (chapter 0.1), including in copied text. Add new placeholder keys in `src/lib/placeholders.jsx`. Outside code, escape them (`\<HOST_LAN_IP\>`), because `<` starts JSX in MDX.

### Classroom and home lab

Readers follow the guide either in the Red Hat classroom or on the home lab from Chapter 0. Where the two differ, show both. The reader's choice is one site-wide preference.

| Component | Use |
| --- | --- |
| `<Env><Classroom>…</Classroom><HomeLab>…</HomeLab></Env>` | Two versions of a command, file or output. A switch shows one at a time. |
| `<HomeLab title="…">…</HomeLab>` on its own | An always-visible note for home-lab readers (teal callout). |
| `<Lab classroom="lab start NAME">` | Adds the "Before you begin" box with both environments. At home it lists the starter files of `public/lab/NAME/`. Pass `starter={false}` if there are none. |
| `<Lab classroom="lab start NAME" own>` | For an exercise that exists only in this guide: the classroom tab then tells readers to create the folder themselves. |
| `<HomeSetup>…</HomeSetup>` inside `<Lab>` | Extra home-lab preparation notes for that exercise. |
| `<Finish name="NAME" />` (add `grade` for chapter labs) | The body of an exercise's last task, for both environments. |

Keep the classroom commands as the default text of an exercise, and use these only where the home lab really differs (no execution environment, Rocky facts, firewalld running, `sdb` for `vdb`).

### Exercise starter files

Every exercise that starts with `lab start NAME` needs a folder `public/lab/NAME/`:

```text
public/lab/NAME/
  MANIFEST        first line "# title"; then one path per line; "dest=src" to rename (for dotfiles); "@setup.sh" runs a script
  ansible.cfg, inventory, files/…
  setup.sh        optional: generates files on the reader's workstation (certificates, Vault files)
```

Add the exercise to `public/lab/INDEX`. The home-lab `lab` command (`public/lab/lab`, installed in section 0.6) downloads these into `~/NAME`. Test with `LAB_URL=file://$PWD/public/lab bash public/lab/lab start NAME`, and run the exercise's solution against the lab before you publish it.

## 6. Code font

All code uses the `--font-mono` token (JetBrains Mono, with code ligatures turned off so `!=` and `->` show as typed). Sizes come from `--code-size` (blocks and terminals), `--code-size-sm` (compact widgets) and `--code-inline` (inline code in text). Use these tokens rather than hard-coded values.

## 7. Stable activities and skills

Give each question and task a unique, descriptive ID, such as `ch02-inventory-child-groups` or `ch02-inventory-verify`. Keep it when moving or improving the activity. New activities do not need `legacyIndex`; preserve the existing indices and frozen `src/data/legacyActivityMap.json` for earlier learners.

```mdx
<Quiz id="check" objectives={["ch02.inventory"]} questions={[{
  id: "ch02-example-group-membership",
  q: "Which group contains the child group's hosts?",
  options: ["The parent", "Only the child"],
  answer: 0,
  explain: "A parent includes the hosts of its children.",
}]} />
```

Add or update the objective in `content/_objectives.yml` and the chapter's `objectiveIds`. Each objective links to its teaching, practice, and lab pages. Use original explanations and cite public documentation where a version difference matters.

Browser challenges are authored in their chapter's quiz MDX, as a JSON-compatible `export const practice = [...]` followed by `<ChapterPractice chapter="chNN" challenges={practice} />`. Supply a stable `id`, chapter, objective, type, `prompt`, starter input or choices, `expected` result, nonempty progressive hints, explanation, and optional explicit solution. The build reads the same export for the dashboard; editing wording needs no React change. Keep simulations within the supported parser behavior. Test correct, incorrect, incomplete, and equivalent answers in `tests/challenges.test.js`; compare relevant cases with actual Ansible.

Lab wording belongs in MDX. A graded `<Lab>` contains exactly one `<LabNotes>` and one `<LabChallenge>`, alongside its existing `<Task>` children. `LabNotes` holds prerequisites and optional verification/variation reveals. `LabChallenge` holds a short purpose and a list of outcomes, target values, and constraints. Write these as requirements a learner can solve independently: avoid prescribing each module, YAML key, and task order unless that technique is itself the skill being assessed.

```mdx
<Lab id="site" classroom="lab start example-site" objectives={["ch02.playbooks"]}>
  <LabNotes>
    **Prerequisites:** working SSH and sudo access to the target.

    <Reveal title="Verify your work">
      Fetch the page from workstation, repeat the deployment, and inspect unexpected changes.
    </Reveal>
  </LabNotes>
  <LabChallenge>
    Publish the supplied page on the inventory's web hosts.

    - Apache must run now and start at boot.
    - Workstation must receive the supplied content over HTTP.
  </LabChallenge>
  <Task id="example-site-service" title="Prepare the web service">
    Explain the purpose, show the small step, and say how to verify it.
  </Task>
</Lab>
```

Guided mode renders tasks normally. Challenge mode renders the authored requirement brief and keeps the entire task walkthrough/checklist closed until requested. Components never guess which child is a question or manufacture a hint from the remaining children. Setup labs without an authored challenge show the walkthrough only. Keep solutions inside nonempty `<Reveal>` elements; never publish an empty disclosure.

The grading catalog contains only machine-check contracts and intentionally broken fixture declarations. Teaching text is not fetched from it.

For a new exercise, add a starter manifest and index entry plus a `graders.json` entry. Each probe needs stable IDs, required target hosts, read-only commands, and a useful failure explanation. Use named checkpoints where later tasks intentionally remove earlier results. Increment the exercise version when the grading contract changes and regenerate the browser report schema:

```bash
node scripts/generate-report-schema.mjs
```

Never treat a mocked passing probe as real host validation. Test the published solution, a deliberate broken state, repeat execution, reset behavior, and reboot persistence where relevant. Record the tested stack and limitations in `docs/VALIDATION.md`.

## 8. Before you commit

```bash
npm run format
npm run format:check
npm run validate:content
npm test
npm run test:labs
npm run build
python3 -m pip install -r tests/browser-requirements.txt
python3 -m playwright install chromium
npm run test:browser
```

Then open the page in both light and dark mode, and at phone width.

For the behavior-comparison script, use a disposable control-node environment with Ansible installed:

```bash
python3 scripts/validate-ansible-simulations.py
```

It creates a temporary local project, uses the local connection, and prints the runtime and passed comparisons. It does not validate remote system-administration labs.
