import { useCallback, useEffect, useMemo, useState } from 'react';
import { zxcvbn } from '@zxcvbn-ts/core';
import { generateDicewarePassphrase } from '../lib/diceware';
import { DICEWARE_WORD_COUNT } from '../lib/diceware-words';
import {
	charsetEntropy,
	crackTimeMeterPercent,
	dicewareEntropy,
	SCORE_LABELS,
	scoreClass,
} from '../lib/entropy';
import { formatBits, formatCrackTime } from '../lib/format';
import { initZxcvbn } from '../lib/zxcvbn-init';

initZxcvbn();

const HASH_RATE = 10_000; // offline slow hashing, guesses per second

type Mode = 'analyze' | 'diceware';

export default function PasswordLab() {
	const [mode, setMode] = useState<Mode>('analyze');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [wordCount, setWordCount] = useState(6);
	const [separator, setSeparator] = useState('-');
	const [passphrase, setPassphrase] = useState('');
	const [copied, setCopied] = useState(false);

	const analysis = useMemo(() => {
		if (!password) {
			return {
				score: 0,
				guesses: 0,
				crackSeconds: 0,
				charsetBits: 0,
				feedback: [] as string[],
			};
		}

		const result = zxcvbn(password);
		const crackSeconds = result.guesses / HASH_RATE;

		return {
			score: result.score,
			guesses: result.guesses,
			crackSeconds,
			charsetBits: charsetEntropy(password),
			feedback: [
				...(result.feedback.warning ? [result.feedback.warning] : []),
				...result.feedback.suggestions,
			],
		};
	}, [password]);

	const passphraseBits = useMemo(
		() => dicewareEntropy(wordCount, DICEWARE_WORD_COUNT),
		[wordCount],
	);

	const passphraseCrackSeconds = 2 ** passphraseBits / HASH_RATE;
	const meterPercent = useMemo(() => {
		if (mode === 'analyze') return crackTimeMeterPercent(analysis.crackSeconds);
		return crackTimeMeterPercent(passphraseCrackSeconds);
	}, [mode, analysis.crackSeconds, passphraseCrackSeconds]);

	const activeCrackSeconds = mode === 'analyze' ? analysis.crackSeconds : passphraseCrackSeconds;
	const activeBits = mode === 'analyze' ? analysis.charsetBits : passphraseBits;

	const handleGenerate = useCallback(() => {
		setPassphrase(generateDicewarePassphrase(wordCount, separator));
	}, [wordCount, separator]);

	useEffect(() => {
		if (mode === 'diceware' && !passphrase) {
			setPassphrase(generateDicewarePassphrase(wordCount, separator));
		}
	}, [mode, passphrase, wordCount, separator]);

	const handleCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="pw-lab">
			<div className="mode-toggle" role="tablist" aria-label="Tool mode">
				<button
					type="button"
					role="tab"
					className={`mode-btn${mode === 'analyze' ? ' active' : ''}`}
					aria-selected={mode === 'analyze'}
					onClick={() => setMode('analyze')}
				>
					Analyze password
				</button>
				<button
					type="button"
					role="tab"
					className={`mode-btn${mode === 'diceware' ? ' active' : ''}`}
					aria-selected={mode === 'diceware'}
					onClick={() => setMode('diceware')}
				>
					Diceware generator
				</button>
			</div>

			{mode === 'analyze' ? (
				<section className="panel" aria-label="Password analyzer">
					<label htmlFor="password-input" className="field-label">
						Password or passphrase
					</label>
					<div className="input-row">
						<input
							id="password-input"
							type={showPassword ? 'text' : 'password'}
							className="text-input"
							placeholder="Type or paste a password…"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="off"
							spellCheck={false}
						/>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => setShowPassword((v) => !v)}
							aria-pressed={showPassword}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
				</section>
			) : (
				<section className="panel" aria-label="Diceware generator">
					<div className="diceware-controls">
						<label className="field-label" htmlFor="word-count">
							Words
							<span className="field-hint">{wordCount} words · {formatBits(passphraseBits)}</span>
						</label>
						<input
							id="word-count"
							type="range"
							min={4}
							max={10}
							value={wordCount}
							onChange={(e) => setWordCount(Number(e.target.value))}
						/>
						<label className="field-label" htmlFor="separator">
							Separator
						</label>
						<select
							id="separator"
							className="select-input"
							value={separator}
							onChange={(e) => setSeparator(e.target.value)}
						>
							<option value="-">Hyphen (-)</option>
							<option value=" ">Space</option>
							<option value=".">Dot (.)</option>
							<option value="_">Underscore (_)</option>
						</select>
					</div>

					<div className="passphrase-box">
						<code className="passphrase-text">{passphrase || '…'}</code>
						<div className="passphrase-actions">
							<button type="button" className="btn" onClick={handleGenerate}>
								Regenerate
							</button>
							<button
								type="button"
								className="btn btn-ghost"
								onClick={() => handleCopy(passphrase)}
								disabled={!passphrase}
							>
								{copied ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>
					<p className="diceware-note">
						Uses the EFF large word list ({DICEWARE_WORD_COUNT.toLocaleString()} words) and
						`crypto.getRandomValues` for unbiased dice rolls.
					</p>
				</section>
			)}

			<section className="results-panel" aria-live="polite">
				<div className="score-row">
					{mode === 'analyze' && password ? (
						<span className={`score-badge ${scoreClass(analysis.score)}`}>
							{SCORE_LABELS[analysis.score]}
						</span>
					) : mode === 'diceware' ? (
						<span className="score-badge score-4">Diceware</span>
					) : (
						<span className="score-badge score-none">Waiting for input</span>
					)}
					<span className="bits-label">{formatBits(activeBits)} of entropy</span>
				</div>

				<div className="meter-block">
					<div className="meter-header">
						<span>Time to crack</span>
						<strong>{password || mode === 'diceware' ? formatCrackTime(activeCrackSeconds) : '—'}</strong>
					</div>
					<p className="meter-sub">
						Assumes offline attack at {HASH_RATE.toLocaleString()} guesses/sec (slow hash).
					</p>
					<div className="meter-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(meterPercent)}>
						<div
							className={`meter-fill${mode === 'analyze' ? ` ${scoreClass(analysis.score)}` : ' score-4'}`}
							style={{ width: `${meterPercent}%` }}
						/>
					</div>
				</div>

				{mode === 'analyze' && analysis.feedback.length > 0 && (
					<ul className="feedback-list">
						{analysis.feedback.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				)}

				{mode === 'analyze' && password && (
					<dl className="stats-grid">
						<div>
							<dt>zxcvbn score</dt>
							<dd>{analysis.score} / 4</dd>
						</div>
						<div>
							<dt>Guesses needed</dt>
							<dd>{analysis.guesses.toLocaleString()}</dd>
						</div>
						<div>
							<dt>Charset entropy</dt>
							<dd>{formatBits(analysis.charsetBits)}</dd>
						</div>
					</dl>
				)}
			</section>

			<style>{`
				.pw-lab {
					display: flex;
					flex-direction: column;
					gap: 1.25rem;
				}

				.mode-toggle {
					display: flex;
					gap: 0.5rem;
					flex-wrap: wrap;
				}

				.mode-btn {
					background: var(--surface);
					color: var(--muted);
					border: 1px solid var(--border);
					border-radius: 8px;
					padding: 0.55rem 1rem;
					font-size: 0.9rem;
					font-weight: 600;
					cursor: pointer;
				}

				.mode-btn.active {
					background: var(--accent-soft);
					color: var(--accent);
					border-color: rgba(63, 185, 80, 0.45);
				}

				.panel,
				.results-panel {
					background: var(--surface);
					border: 1px solid var(--border);
					border-radius: 12px;
					padding: 1.25rem 1.5rem;
				}

				.field-label {
					display: flex;
					justify-content: space-between;
					align-items: baseline;
					gap: 0.75rem;
					font-weight: 600;
					margin-bottom: 0.5rem;
					font-size: 0.92rem;
				}

				.field-hint {
					color: var(--muted);
					font-weight: 400;
					font-size: 0.82rem;
				}

				.input-row {
					display: flex;
					gap: 0.75rem;
					flex-wrap: wrap;
				}

				.text-input,
				.select-input {
					flex: 1;
					min-width: 200px;
					background: var(--surface-raised);
					border: 1px solid var(--border);
					border-radius: 8px;
					padding: 0.65rem 0.85rem;
					color: var(--text);
					font-size: 1rem;
				}

				.text-input:focus,
				.select-input:focus {
					outline: 2px solid rgba(63, 185, 80, 0.45);
					outline-offset: 1px;
				}

				.diceware-controls {
					display: grid;
					gap: 0.75rem;
					margin-bottom: 1rem;
				}

				.passphrase-box {
					background: var(--surface-raised);
					border: 1px solid var(--border);
					border-radius: 10px;
					padding: 1rem;
				}

				.passphrase-text {
					display: block;
					font-size: 1.05rem;
					line-height: 1.5;
					word-break: break-word;
					margin-bottom: 0.85rem;
				}

				.passphrase-actions {
					display: flex;
					gap: 0.75rem;
					flex-wrap: wrap;
				}

				.diceware-note {
					color: var(--muted);
					font-size: 0.85rem;
					margin: 0.85rem 0 0;
				}

				.btn {
					background: var(--accent);
					color: #0d1117;
					border: none;
					border-radius: 8px;
					padding: 0.55rem 1rem;
					font-size: 0.9rem;
					font-weight: 600;
					cursor: pointer;
				}

				.btn:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.btn-ghost {
					background: transparent;
					color: var(--muted);
					border: 1px solid var(--border);
				}

				.score-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 1rem;
					flex-wrap: wrap;
					margin-bottom: 1rem;
				}

				.score-badge {
					font-size: 0.8rem;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.06em;
					padding: 0.35rem 0.75rem;
					border-radius: 999px;
					border: 1px solid transparent;
				}

				.score-0, .score-1 { color: var(--critical); background: rgba(248, 81, 73, 0.14); border-color: rgba(248, 81, 73, 0.4); }
				.score-2 { color: var(--medium); background: rgba(210, 153, 34, 0.14); border-color: rgba(210, 153, 34, 0.4); }
				.score-3 { color: var(--low); background: rgba(63, 185, 80, 0.14); border-color: rgba(63, 185, 80, 0.35); }
				.score-4 { color: var(--accent); background: var(--accent-soft); border-color: rgba(63, 185, 80, 0.45); }
				.score-none { color: var(--none); background: rgba(145, 152, 161, 0.14); border-color: rgba(145, 152, 161, 0.35); }

				.bits-label {
					color: var(--muted);
					font-size: 0.92rem;
					font-variant-numeric: tabular-nums;
				}

				.meter-block {
					margin-bottom: 1rem;
				}

				.meter-header {
					display: flex;
					justify-content: space-between;
					align-items: baseline;
					gap: 1rem;
					flex-wrap: wrap;
				}

				.meter-header strong {
					font-size: 1.1rem;
					color: var(--text);
				}

				.meter-sub {
					color: var(--muted);
					font-size: 0.82rem;
					margin: 0.25rem 0 0.65rem;
				}

				.meter-track {
					height: 12px;
					background: var(--surface-raised);
					border: 1px solid var(--border);
					border-radius: 999px;
					overflow: hidden;
				}

				.meter-fill {
					height: 100%;
					border-radius: 999px;
					transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
					background: var(--muted);
				}

				.meter-fill.score-0,
				.meter-fill.score-1 { background: linear-gradient(90deg, var(--critical), #ff7b72); }
				.meter-fill.score-2 { background: linear-gradient(90deg, var(--medium), #e3b341); }
				.meter-fill.score-3 { background: linear-gradient(90deg, var(--low), #56d364); }
				.meter-fill.score-4 { background: linear-gradient(90deg, var(--accent), #7ee787); }

				.feedback-list {
					margin: 0 0 1rem;
					padding-left: 1.2rem;
					color: var(--muted);
					font-size: 0.9rem;
				}

				.stats-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
					gap: 0.75rem;
					margin: 0;
				}

				.stats-grid dt {
					color: var(--muted);
					font-size: 0.78rem;
					text-transform: uppercase;
					letter-spacing: 0.04em;
				}

				.stats-grid dd {
					margin: 0.15rem 0 0;
					font-weight: 600;
					font-variant-numeric: tabular-nums;
				}
			`}</style>
		</div>
	);
}
