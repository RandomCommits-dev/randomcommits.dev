---
title: "CVSS scoring, without the spreadsheet"
description: "Why a browser-side CVSS calculator belongs in the lab, and what makes 3.1 and 4.0 different at a glance."
pubDate: 2026-07-08
tags: ["security", "cvss", "vuln-mgmt", "lab"]
growth: "budding"
---

Every vulnerability advisory eventually needs a severity number. CVSS (Common
Vulnerability Scoring System) is the lingua franca: a vector string like
`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` that encodes exploitability
and impact, then collapses into a 0–10 score.

The problem is not the math. It is the friction. Official calculators exist,
but they are often clunky, session-based, or buried inside enterprise tools.
When you are writing a ticket, triaging a CVE, or sanity-checking a vendor
score, you want something fast, readable, and offline.

## What lab-cvss-calc does

[lab-cvss-calc](https://github.com/RandomCommits-dev/lab-cvss-calc) is a
privacy-first browser tool that scores **CVSS 3.1** and **CVSS 4.0** base
metrics. Pick a version, adjust the metrics with plain-English labels, and
watch the score and severity badge update live. Copy the vector string into
your advisory, or share a link with the vector baked into the URL hash.

Nothing leaves your browser. Scoring follows the official FIRST specifications,
implemented via [`@hailbytes/cvss-calc`](https://www.npmjs.com/package/@hailbytes/cvss-calc).

## 3.1 vs 4.0 in one glance

| | CVSS 3.1 | CVSS 4.0 |
|---|---|---|
| Impact metrics | Single C / I / A triad | Separate vulnerable-system (VC/VI/VA) and subsequent-system (SC/SI/SA) |
| Scope | Explicit `S:U` or `S:C` | Replaced by the split impact model |
| New in 4.0 | — | Attack Requirements (`AT`), richer user interaction (`UI:N/P/A`) |
| Typical use | Still dominant in NVD and most advisories today | Growing adoption for finer-grained scoring |

For most day-to-day triage, 3.1 is still the default. 4.0 is worth learning
when you need to express impact on downstream systems separately from the
vulnerable component itself.

## When to reach for it

- Triaging a CVE and the NVD vector looks wrong
- Writing an internal advisory and you want the vector string, not just the number
- Comparing how a finding scores under 3.1 vs 4.0
- Teaching someone what each metric actually means

The calculator is a sketching tool, not a replacement for environmental or
temporal scoring. But for base-score sanity checks, it should be one click away.
