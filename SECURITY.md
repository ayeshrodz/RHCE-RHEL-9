# Security policy

Kernel Path is a static website: there is no server, no database and no user accounts. Readers' progress stays in their own browser. The platform is built so that content, which many people may write, can never carry code, and so that a compromised content host cannot run script in a reader's browser. The design is in [docs/PLATFORM.md](docs/PLATFORM.md#security-model).

## What counts as a security problem

- Anything that lets content (a page, a data file, an exercise definition, a progress file a reader imports) run script, inject markup or styles, or make the browser contact another site.
- A way around the content security policy, the integrity checks, or the signature check.
- An exercise action or check that runs a command taken from content, writes outside the learner's project folder, or changes a managed host while grading.
- A vulnerable dependency that affects the built site or the build.
- Unsafe advice in the lab instructions (for example a firewall step that exposes more than intended).

## Reporting

Please report problems privately, not in a public issue:

1. Go to the **Security** tab of the repository and choose **Report a vulnerability**.
2. Describe the problem and how to reproduce it. A page, file or progress export that triggers it is ideal.

You can expect a first reply within about a week. Fixes are made through a normal pull request once the details can be public, and the report is credited unless you prefer otherwise.

## Supported versions

Only the current version on the `main` branch, which is what the website serves.

## Hardening you can verify

- The built page carries a strict content security policy (own scripts, styles and fonts only; Trusted Types required) and integrity hashes; browser tests fail on any violation.
- Content files are fingerprinted in their names and size-limited, and can be signed; see [docs/HOSTING.md](docs/HOSTING.md).
- `tests/fuzz.test.js` attacks the compiler, the validators and the progress importer with hostile input on every change.
