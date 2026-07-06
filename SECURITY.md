# Security Policy

## Threat model

randomcommits.dev is a **fully static** site hosted on GitHub Pages. There is no server-side runtime, no user authentication, and no form submissions. The attack surface is limited to the static HTML, CSS, and JavaScript served to browsers.

## Secret handling

- `GITHUB_TOKEN` is used **only at build time** in `src/content.config.ts` to fetch public org repo metadata from the GitHub API.
- CI injects an ephemeral `GITHUB_TOKEN` via GitHub Actions secrets. It is never committed to the repo.
- Tokens and environment variables **never appear** in `dist/` or client-side JavaScript bundles.
- Local developers may optionally set `GITHUB_TOKEN` in a gitignored `.env` file (see `.env.example`). **Never commit real tokens.**

## What is public

The deployed site publishes only **public** information:

- Org repo names, descriptions, homepage URLs, languages, and star counts (from the GitHub public API)
- Garden notes authored in `src/content/notes`
- Lab roadmap descriptions in `src/data/lab-sections.ts`

Private, forked, and archived repos are filtered out at build time.

## Contributor rules

1. Never commit `.env`, PATs, API keys, certificates, or private repo data.
2. Use `.env.example` as a template; keep values empty in tracked files.
3. Lab tools must run client-side with no data sent to third-party servers unless explicitly documented.

## Reporting a vulnerability

If you discover a security issue, please report it via [GitHub Security Advisories](https://github.com/RandomCommits-dev/randomcommits.dev/security/advisories/new) for this repository.

## Future hardening

Custom HTTP security headers (`Content-Security-Policy`, `X-Frame-Options`, etc.) require a CDN or reverse proxy in front of GitHub Pages. This is a future option if the domain moves behind Cloudflare or similar.
