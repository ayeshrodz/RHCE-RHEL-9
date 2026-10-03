---
title: Turn text into a report
kind: lesson
minutes: 10
---

{% lead %}Small text tools answer useful questions when you define the record format and compare the report with the source.{% /lead %}

{% objectives %}
- Edit and compare text without accidentally changing unrelated lines.
- Extract reliable reports using fields, sorting and regular expressions.
{% /objectives %}

## Choose the field model

`cut -d: -f1 /etc/passwd` selects a delimiter-based field. `awk -F: '{print $1, $3}' /etc/passwd` selects and formats fields. Neither knows that a field represents an account until you interpret the format. Use `getent passwd` later when your system may use directory services; the local file is not necessarily the complete identity database.

```bash
getent passwd | awk -F: '$3 >= 1000 && $3 < 65534 {print $1, $3}'
```

A UID range is a policy assumption, not proof of a human account. Some service users can have high IDs and some directories use other ranges. Label a report with its selection rule.

## Sort before counting duplicates

`uniq` merges adjacent duplicates only. Use `sort | uniq -c` when equivalent records are separated. `sort -n` sorts numbers; plain sort uses lexical order. Locale affects ordering; use `LC_ALL=C` when a reproducible bytewise order is required.

```bash
printf '%s\n' web db web api | LC_ALL=C sort | uniq -c
```

`sed -n '1,5p'` prints a range. `sed 's/old/new/g'` transforms stdout and leaves the input alone. Review that output before using `-i`, which edits in place. A substitution pattern is a regular expression, so quote it and escape literal punctuation as required.

## Match the intended language

Basic and extended grep expressions differ in repetition syntax. Prefer `grep -E` when teaching alternation and `+`. `^` and `$` anchor lines; `[0-9]` selects a digit; `.` matches any character. A literal dot in a hostname needs `\.` or use `grep -F` for a literal string. `grep -v` selects non-matching lines and `grep -n` includes source line numbers.

A here-document writes multiple lines. Quote the delimiter, as in `<<'EOF'`, when variables must remain literal. Leave it unquoted only when expansion is intended. Test parsers on blank lines, comments and near matches; a report built from a neat fixture can still fail on real data.

## Check your understanding

{% quiz id="quick" objectives=["ch05.operations", "ch05.verification"] ref="quick" /%}


## Documentation

- [Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [Bash manual](https://www.gnu.org/software/bash/manual/bash.html)
