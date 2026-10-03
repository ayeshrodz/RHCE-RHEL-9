---
title: Small scripts with clear contracts
kind: lesson
minutes: 10
---

{% lead %}A useful administration script makes its inputs, outputs and failure conditions clear. Automation magnifies mistakes as readily as it repeats correct work.{% /lead %}

{% objectives %}
- Write small scripts with explicit input and failure behavior.
- Choose and verify cron, at or systemd timer scheduling.
{% /objectives %}

## Define the interface

Use a shebang such as `#!/bin/bash`, quote expansions and give meaningful exit codes. `$1` is the first argument; `$#` counts arguments. `${1:-}` safely supplies an empty default when the argument is absent. `$()` captures command output and removes trailing newlines.

```bash
#!/bin/bash
if [ "$#" -ne 1 ]; then
    printf 'Usage: %s FILE\n' "$0" >&2
    exit 2
fi
if [ ! -r "$1" ]; then
    printf 'Cannot read: %s\n' "$1" >&2
    exit 1
fi
wc -l < "$1"
```

`bash -n script` checks syntax without running it. `bash script file` reads a script directly; executable mode and a shebang are needed for `./script file`. Execute permission does not make a malformed script valid. Check the interpreter exists and beware Windows line endings in transferred files.

## Conditionals and loops

`if command; then` branches on command status. Bash `[[ ... ]]` supports useful test expressions without ordinary word splitting. A quoted `for item in "$@"` iterates arguments intact; `for item in $(ls)` does not safely enumerate arbitrary filenames. For line input use `while IFS= read -r line`, understanding whether a pipeline creates a subshell and where variable changes persist.

Avoid `eval` on untrusted input. Validate any user-supplied path or value before using it in a privileged operation. Prefer clear small functions and explicit errors over clever compact syntax.

## Failure and cleanup

`set -o pipefail` helps detect upstream pipeline failures. `set -e` has context-dependent behavior and does not replace deliberate status handling. Traps can remove temporary files on exit, but cleanup must never expand an unchecked empty path. Use `mktemp`, retain its exact path, and quote it.

Test normal input, missing input, spaces, empty files and denied access. A script that silently emits an empty success report after a failed read is worse than a loud failure. Do not place passwords in arguments, source code or diagnostic traces.

## Explore the model

{% flow-map ref="model" title="Scripts and scheduling: relationships" caption="Select each part to read its role." /%}


## Check your understanding

{% quiz id="quick" objectives=["ch15.operations", "ch15.verification"] ref="quick" /%}


## Documentation

- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
- [RHEL systemd guide](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_systemd_unit_files_to_customize_and_optimize_your_system/index)
