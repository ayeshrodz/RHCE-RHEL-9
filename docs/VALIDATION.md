# Validation evidence

Results recorded on 2 October 2026. VM work uses isolated copies of clean lab snapshots and separate copied data volumes.

## Documented lab stack

- Rocky Linux 9.8 guests on LXD virtual machines.
- ansible-core 2.14.18 on workstation; ansible-navigator 26.9.0.
- ansible.posix 1.5.4, community.general 9.5.13, redhat.rhel_system_roles 1.120.5.
- Home-lab disk `/dev/sdb`; classroom examples use `/dev/vdb`.

## Verified on VMs

| Exercise | Solution run | Second run | Local checks |
| --- | --- | --- | --- |
| `bridge-archive` | Passed | `changed=0` | Passed |
| `bridge-security` | Passed | `changed=0` | Passed |
| `system-storage` | Passed, XFS volumes 512 and 768 MiB | `changed=0` | Passed |
| `system-network` | Passed, dummy interface | `changed=0` | Passed |
| `assessment-release` | Passed | `changed=0` | Passed |
| `assessment-operations` | Passed | `changed=0` | Passed |
| `control-flow` | Both database groups configured | `changed=0` on production | Passed; stopped production service detected |
| `review-playbooks` | Deployment, intentional failure, then recovery | `changed=0` before intentional stop | All three checkpoints passed |
| `troubleshoot-review` | Corrected TLS deployment | `changed=0` | Passed; wrong physical host detected |

Broken security permissions and a damaged restored file were detected by the grader. An invalid sudo policy was rejected before replacing the valid policy. Recovery succeeded, and all four graders passed after an explicit VM reboot.

These results validate the listed cases on this stack. The remaining exercises and intermediate checkpoints still need complete VM runs with their published solutions, deliberately broken states, and applicable reboot checks. VM-dependent PRs remain drafts until their required checks are recorded.

## Automated coverage

- JavaScript regression tests cover import rejection without progress loss, older exports, unavailable storage, cyclic inventory groups, bounded ranges, template behavior, and all twenty browser challenge solutions with invalid inputs.
- Python fixtures exercise every grading checkpoint with successful, failing, and unreachable responses. They validate control flow and report behavior; they do not establish that each shell probe matches a real host.
- Downloader tests cover missing files, failing setup hooks, unsafe manifest paths, preservation of existing work, and successful preparation.
- Production build and formatting checks pass.

## Learning progress and assessments

- 36 JavaScript tests pass, including version 1 migration, stable task/confidence IDs, quiz history after resets and corrections, version 2 round trips, complete lab report validation, and cross-tab cache updates.
- Chromium verified quiz persistence, legacy quiz migration, review queue links, timer persistence after reload, cross-tab updates, and the unavailable-storage message. Mobile assessment layout has no horizontal page overflow.
- The web-release assessment deployed successfully, repeated with no unexpected changes, passed its grader, served the expected page to workstation, and passed after a reboot.
- The operations assessment deployed successfully, repeated with `changed=0`, passed its grader, allowed the reporter SSH login and limited sudo command, and passed after a reboot.

## Platform quality

- 39 JavaScript tests and six Python test cases pass. Shared-descendant inventory graphs, large wildcard searches, corrupted saved values, imports, migrations, and activity answers have regression coverage.
- Chromium loads all 125 production routes without page errors or horizontal overflow. Additional checks cover mobile layouts, dialog/drawer focus, links into optional reveals, quiz reloads, challenge feedback, persistent assessment timing, progress export/import, complete and incomplete lab report imports, cross-tab updates, blocked storage, and corrupted storage.
- Main JavaScript fell from approximately 824 KB to 520 KB before compression (250 KB to 153 KB gzipped). Chapter widgets, challenge editors, search, and the learning dashboard load separately.
- Content checks cover 270 questions, 401 tasks, 20 challenges, 43 objectives, and all 42 starter manifests. Build and formatting pass.
- `scripts/validate-ansible-simulations.py` passed on core 2.14.18: idempotency, variable precedence, a defaults-only role, template equality/filter/default, handler coalescing and timing, include/import conditions, rescue/always, secret-output suppression, undefined conditions, and inventory selection/exclusion.

The three additional system cases used isolated VMs that already contained earlier validation work. The TLS case needed Apache cycled after installing mod_ssl to create the distribution's default certificate; a fresh-start run remains pending. A further clean reset and volume copy encountered long-running LXD operations. This limits the reset evidence and does not replace the remaining full exercise/checkpoint matrix.

Reboot checks for the three additional cases remain pending: SSH did not return for the isolated guests during the final reboot attempt. Earlier reboot evidence for archive, security, storage, networking, and both assessments remains recorded above.

At the end of this run, LXD still had a storage-copy operation pending, and a validation-guest restart could not complete. The copy operation rejected cancellation. Original lab instances and clean snapshots were preserved. Isolated validation copies were retained for the remaining host checks.

## Content and visual review after feature delivery

The feature checks above did not establish the editorial and visual quality of the new learning flows. A further review addressed the dashboard, lab mode semantics, empty disclosures, and the workflow bridge:

- All 42 graded labs now have independently authored MDX challenge requirements, prerequisites, verification notes, and specific variations. Guided steps and solutions remain available inside a closed walkthrough in Challenge mode. The 13 setup walkthroughs do not offer a simulated challenge mode.
- All 20 browser activity definitions moved to their chapter quiz MDX exports. The renderer and grading engine remain reusable code; the build shares those definitions with the dashboard. Lab grading JSON contains machine contracts rather than learner-facing briefs.
- Chapter 11 explains its place in the course, prerequisites, environment boundaries, purpose of each workflow, expected output, recovery checks, and policy validation. Existing routes, activity IDs, and heading anchors are retained.
- The learning dashboard uses shared page typography and card styling. Practice controls use standard buttons, with deliberate spacing for feedback and solutions. Desktop and phone screenshots were visually reviewed; automated checks verify light/dark dashboard heading margins, button height, action spacing, and page overflow.
- Production Chromium checks pass on all 125 routes and both modes of all 42 graded labs. Mode changes/reloads retain task completion; closed walkthroughs hide guided instructions; keyboard dialogs, report imports, export/import round trips, storage failures, and cross-tab progress updates still pass.
- The revised Git workflow was executed on workstation with ansible-core 2.14.18: initial localhost run, commit/push, message change, second commit/push, second clone, two-commit history, and recovered localhost run passed. Only a temporary practice directory was used and removed afterward. Navigator's installed exec help confirms the documented subcommand/options.
- A fresh VS Code desktop/container walkthrough remains pending. Earlier archive/security VM results remain applicable to the unchanged solution behavior; this editorial review does not establish complete VM coverage of all 42 exercises. The existing pending lab validation remains in effect.

Content CI now requires a purpose and multiple requirements in each challenge brief and rejects empty authored reveals or browser hints. Build, formatting, content validation, 39 JavaScript tests, six Python test cases, and the expanded production browser checks pass.

## Shared activity styling and exercise naming

- Knowledge checks and all 20 browser activities share the same panel header, answer rows, feedback treatment, theme tokens, and native solution reveal. New practice actions and the next-lesson action use neutral standard buttons; environment and exercise modes share the muted switch.
- Forty practical pages use `Exercise: Topic`; the two integrated assessments use `Assessment: Topic`. The homepage and exercise-type labels follow that wording. Published filenames, heading anchors, activity IDs, grading identifiers, and progress keys remain unchanged.
- Light desktop screenshots of practice, expanded solutions, exercise modes, and the dashboard were visually reviewed. Phone editor screenshots were reviewed in light and dark themes. Production browser checks compare practice and quiz panel styles and title sizes, reject primary buttons in the new controls, and verify solution disclosure/reset behavior and saved solution-use evidence.
- Build, formatting, content validation, 39 JavaScript tests, six Python cases, and the production browser suite pass. All 125 routes and both modes of all 42 graded exercises remain covered. The existing pending VM and desktop workflow validation still applies; this styling and naming review does not change lab behavior.

Contributor documentation records the shared rendering components and title conventions. Content validation enforces colon-separated exercise and assessment titles while MDX remains the source of learner-facing wording.

## Platform reference page and track content boundary

- The header's RHEL 9 badge opens `#/platform` as a page. Its title, introduction, explanations, version comparison, and diagram data come from track-owned MDX and metadata under `content/tracks/rhel9/`. The previous modal and its styles were removed.
- Shared `ReferencePage`, `FlowMap`, and heading navigation render the page using existing typography, cards, tables, reveals, diagram tones, and controls. The diagrams use a vertical layout on phones and native buttons for keyboard selection.
- Content validation covers the additional route, reference frontmatter, internal heading links, and diagram step definitions. Three additional JavaScript cases verify selected-track discovery, an independent fixture track, missing metadata, and unsafe paths. All 42 JavaScript cases pass; the existing six Python lab-tool cases pass.
- Production Chromium checks cover all 126 routes, header navigation, title/reload persistence, native tab keyboard behavior, selecting both execution paths, and light/dark phone/desktop heading links without page overflow. Reference visits leave lesson completion unchanged. All previous 42 exercise mode checks remain covered.
- Desktop and phone reference screenshots were visually reviewed in light and dark themes. Build, formatting, content validation, and browser checks pass. The earlier pending VM exercise matrix remains unchanged; no lab execution or grading behavior changed here.

Public AAP 2.2 execution-environment documentation and navigator settings documentation were checked for the reference explanation and inspection commands. The current EX294 page was checked for its latest-product objective scope, Git/editor/container objectives, and version-selection guidance; the platform page links those sources.

## Shared table design

- All 82 Markdown tables use the shared MDX renderer, with unchanged content. Desktop columns receive space according to typical text length, descriptions and commands wrap, and headers remain visible beneath the site navigation while reading long tables. The troubleshooting table previously measured 1,551 pixels inside a 738-pixel reading area; the redesigned table fits that area without horizontal scrolling.
- Styling uses existing neutral theme tokens, pale alternate rows, consistent borders, and spacing. The established mobile labelled cards remain in place and now respond to the table container's width, including nested desktop content. Header associations and explicit table roles remain available in both layouts.
- Three new JavaScript cases cover column allocation, exceptional long commands, blank headings, and two- through five-column layouts. All 45 JavaScript tests and the existing six Python cases pass. Build, formatting, content validation, and diff checks pass.
- Production Chromium loads all 126 routes. Additional table checks cover seven representative pages in light/dark themes at 390, 768, 1024, and 1440 pixels: no table or cell overflow, correct mobile labels, desktop layout, sticky headers, keyboard links, and unchanged command selection. Existing progress flows and both modes of all 42 graded exercises still pass.
- Desktop screenshots of troubleshooting, the five-column host plan, storage, nested inventory tables, and the platform comparison were reviewed. Troubleshooting cards were reviewed on phones in light and dark themes. Lab execution and grading behavior are unchanged; the earlier pending VM validation remains applicable.
