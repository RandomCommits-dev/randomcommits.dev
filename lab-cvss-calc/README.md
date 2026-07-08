# lab-cvss-calc

A fast, friendly CVSS 3.1 and 4.0 calculator. Adjust the base metrics, watch the score and severity update live, and copy a shareable vector string into advisories and tickets.

Currently lives in the [randomcommits.dev](https://github.com/RandomCommits-dev/randomcommits.dev) monorepo at `lab-cvss-calc/`. Will move to its own repo when ready.

## Privacy

Runs entirely in your browser. Nothing you enter is sent anywhere.

## Features

- CVSS 3.1 and 4.0 base score calculation
- Plain-English metric labels and hints
- Live score and severity badge
- Copy vector string to clipboard
- Shareable URL via hash (`#vector=...`)
- Paste an existing vector to load it

## Development

Requires Node 22.12+.

```bash
npm install
npm run dev
```

## Scoring

Uses [`@hailbytes/cvss-calc`](https://www.npmjs.com/package/@hailbytes/cvss-calc), which implements the official [FIRST CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document) and [CVSS v4.0](https://www.first.org/cvss/v4.0/specification-document) specifications.

Part of the [RandomCommits-dev](https://github.com/RandomCommits-dev) lab collection on [randomcommits.dev](https://randomcommits.dev).
