# randomcommits.dev

Landing page and digital garden for [randomcommits.dev](https://randomcommits.dev) — built with [Astro](https://astro.build) + React, hosted on GitHub Pages.

## Tech

- **Astro** — static site generator
- **React** (`@astrojs/react`) — interactive islands (e.g. the random commit generator)
- **GitHub Pages** — hosting, deployed via GitHub Actions on every push to `main`

## Develop

```bash
npm install
npm run dev      # start dev server at http://localhost:4321
npm run build    # build to ./dist
npm run preview  # preview the production build locally
```

## Project structure

```
src/
  pages/index.astro          # the landing page
  components/CommitGenerator.tsx  # a React island
public/
  CNAME                      # custom domain (randomcommits.dev)
.github/workflows/deploy.yml # GitHub Pages deploy
```

## Deployment

Pushes to `main` trigger the **Deploy to GitHub Pages** workflow. Make sure the
repo's **Settings → Pages → Source** is set to **GitHub Actions**, and the custom
domain is configured to `randomcommits.dev`.
