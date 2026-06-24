import { useState } from 'react';

const VERBS = [
  'refactor', 'vibe', 'summon', 'untangle', 'polish', 'yeet',
  'caffeinate', 'whisper to', 'bless', 'gently nudge', 'overthink',
];

const NOUNS = [
  'the void', 'a suspicious regex', 'the build pipeline', 'some CSS',
  'a rogue semicolon', 'the garden', 'a flaky test', 'the homepage',
  'a half-baked idea', 'the dark mode toggle', 'a TODO from 2021',
];

const SUFFIXES = [
  'at 3am', 'with zero tests', 'because why not', 'for the aesthetic',
  '(no idea why this works)', 'and called it a day', 'on a whim',
  'while listening to lo-fi', 'probably', 'one more time',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeMessage(): string {
  return `${pick(VERBS)} ${pick(NOUNS)} ${pick(SUFFIXES)}`;
}

export default function CommitGenerator() {
  const [message, setMessage] = useState<string>(makeMessage);
  const [count, setCount] = useState<number>(0);

  function regenerate() {
    setMessage(makeMessage());
    setCount((c) => c + 1);
  }

  return (
    <div className="commit-card">
      <code className="commit-message">git commit -m "{message}"</code>
      <button className="commit-button" onClick={regenerate}>
        Generate another random commit
      </button>
      {count > 0 && (
        <p className="commit-count">
          {count} random commit{count === 1 ? '' : 's'} and counting.
        </p>
      )}
    </div>
  );
}
