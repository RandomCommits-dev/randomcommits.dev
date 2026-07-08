# lab-cvss-calc export

This directory contains the complete source for
[lab-cvss-calc](https://github.com/RandomCommits-dev/lab-cvss-calc), ready to
push to its own repository.

The cloud agent could not push directly to `RandomCommits-dev/lab-cvss-calc`
(403: insufficient token permissions). To deploy:

```bash
cd export/lab-cvss-calc
npm ci
npm run build
git init
git remote add origin https://github.com/RandomCommits-dev/lab-cvss-calc.git
git add -A
git commit -m "Initial CVSS 3.1 and 4.0 calculator"
git push -u origin main
```

After push, GitHub Actions deploys to:
https://randomcommits-dev.github.io/lab-cvss-calc/

Then delete this `export/` directory from randomcommits.dev if desired.
