# Contributing

Thanks for helping make this guide better. Anyone can propose changes; only the maintainer merges them. Every change goes through a pull request and a review, including the maintainer's own.

## Ways to help

- **Fix a mistake:** a wrong command, an unclear explanation, a broken diagram. Open a *content correction* issue, or send a pull request straight away for small fixes.
- **Test the lab:** follow [Chapter 0](https://ayeshrodz.github.io/RHCE-RHEL-9/#/ch00) on your hardware and report anything that doesn't match.
- **Write a chapter:** chapters 5–10 are planned. Please open an issue first so two people don't write the same one.
- **Improve a diagram or widget**, or the site itself.

## Set up

Requires Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/<you>/RHCE-RHEL-9.git    # your fork
cd RHCE-RHEL-9
npm install
npm run dev                                          # http://localhost:3000, edits show live
```

`docs/AUTHORING.md` explains how sections, frontmatter, components and diagrams work.

## Sending a pull request

1. Fork the repository and create a branch from `main` (for example `content/ch05-templates`).
2. Make your change and look at it in the browser, at desktop and phone width.
3. Run the checks the CI will run:
   ```bash
   npm run format      # fixes formatting
   npm run build       # must succeed
   ```
4. Open a pull request against `main` and fill in the template. Keep it focused: one topic per pull request is much easier to review.

The CI builds your branch and checks formatting. When the maintainer merges, the site redeploys automatically.

## Content rules

- **Write in your own words.** The site is based on the structure of the RH294 course, but the text, examples and diagrams must be original. Commands, configuration snippets and short quotations of tool output are fine; passages copied from the book or other copyrighted sources are not. Never add the book PDF or pages of it.
- **Keep commands tested.** Run them on the lab from Chapter 0 (Rocky Linux 9, ansible-core 2.14) and say so if you didn't. Chapter 0's commands come from a lab that was built and verified, so change them only after re-testing.
- **No personal data.** No real IP addresses, hostnames, usernames, emails, tokens or passwords. The classroom defaults (`student`, `devops`, `redhat`, `172.25.250.0/24`) are public and fine. For values that differ per reader, use the lab placeholders described in `docs/AUTHORING.md`.
- **Exercises work in both environments.** Keep the book's commands as the default, add the home-lab difference with the `Env` / `HomeLab` components, and give each exercise its starter files under `public/lab/` (see `docs/AUTHORING.md`).
- **Follow the look of the site:** existing components, the diagram kit and the RHEL colours, rather than new libraries or styles.

## Licensing of contributions

By submitting a pull request you agree that your contribution is licensed under the same terms as the project: MIT for source code (`LICENSE`) and CC BY 4.0 for written content under `content/` and `docs/` (`LICENSE-CONTENT`).

## Conduct and security

Everyone taking part must follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, see [SECURITY.md](SECURITY.md).
