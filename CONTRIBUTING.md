# Contributing

Thanks for helping make this guide better. Anyone can propose changes; only the maintainer merges them. Every change goes through a pull request and a review, including the maintainer's own.

## Ways to help

- **Fix a mistake:** a wrong command, an unclear explanation, a broken diagram. Open a *content correction* issue, or send a pull request straight away for small fixes.
- **Test the lab:** follow [Chapter 0](https://kernelpath.dev/#/ch01) on your hardware and report anything that doesn't match.
- **Write a chapter:** propose a focused addition or improvement. Open an issue first to agree on its scope.
- **Improve a diagram or widget**, or the site itself.

## Set up

Requires Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/<you>/playbook-path.git    # your fork
cd playbook-path
npm install
npm run dev                                          # http://localhost:3000, edits show live
```

`docs/AUTHORING.md` explains how sections, frontmatter, components and diagrams work.

## Sending a pull request

1. Fork the repository and create a branch from `main` (for example `content/ch06-templates`).
2. Make your change and look at it in the browser, at desktop and phone width.
3. Run the checks the CI will run:
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
4. Open a pull request against `main` and fill in the template. Keep it focused: one topic per pull request is much easier to review.

CI checks content, formatting, JavaScript behavior, lab-tool contracts, and browser learning flows. Record actual VM validation for system changes; leave the PR in draft while required host checks remain. When the maintainer merges, the site redeploys automatically.

## Content rules

- **Write in your own words, from open sources.** Text, examples, exercises and diagrams must be your own work. Base them on the public exam objectives, the official Ansible and RHEL documentation, and what you have tested yourself. Do not copy or closely paraphrase Red Hat training materials, course books, lab scripts or any other copyrighted source, and never add such files to the repository. Commands, configuration snippets and short quotations of tool output are fine.
- **Nothing from the exam.** Red Hat exams are confidential. Do not describe exam tasks, environments or scoring, even from memory.
- **Keep commands tested.** Run them on the lab from Chapter 0 (Rocky Linux 9, ansible-core 2.14) and say so if you didn't. Chapter 0's commands come from a lab that was built and verified, so change them only after re-testing.
- **No personal data.** No real IP addresses, hostnames, usernames, emails, tokens or passwords. The classroom defaults (`student`, `devops`, `redhat`, `172.25.250.0/24`) are public and fine. For values that differ per reader, use the lab placeholders described in `docs/AUTHORING.md`.
- **Exercises work in both environments.** Keep the classroom commands as the default, add the home-lab difference with the `variant-group` / `variant` tags, and give each exercise its starter files under `packages/engine/public/lab/` (see `docs/AUTHORING.md`).
- **Follow the look of the site:** existing components, the diagram kit and the existing colour tokens, rather than new libraries or styles.

## Licensing of contributions

By submitting a pull request you agree that your contribution is licensed under the same terms as the project: MIT for source code (`LICENSE`) and CC BY 4.0 for written content under `content/` and `docs/` (`LICENSE-CONTENT`).

## Conduct and security

Everyone taking part must follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, see [SECURITY.md](SECURITY.md).
