# lab-pw-entropy

A password and passphrase strength visualizer with real entropy math, zxcvbn scoring, and a built-in diceware generator. An animated crack-time meter makes the math tangible.

Currently lives in the [randomcommits.dev](https://github.com/RandomCommits-dev/randomcommits.dev) monorepo at `lab-pw-entropy/`. Will move to its own repo when ready.

## Privacy

Runs entirely in your browser. Nothing you type is sent anywhere.

## Features

- Live password analysis with zxcvbn pattern detection
- Charset-based entropy calculation (bits)
- Animated time-to-crack meter (offline slow-hash assumption)
- Diceware passphrase generator using the EFF large word list
- Unbiased random word selection via `crypto.getRandomValues`

## Development

Requires Node 22.12+.

```bash
npm install
npm run dev
```

Part of the [RandomCommits-dev](https://github.com/RandomCommits-dev) lab collection on [randomcommits.dev](https://randomcommits.dev).
