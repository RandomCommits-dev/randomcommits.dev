import { useCallback, useEffect, useState } from 'react';
import { convertSigmaRule, disposeSigmaConverter, formatEngineStatus } from '../lib/sigma-converter';
import { SAMPLE_SIGMA_RULE, TARGETS, type SigmaTarget } from '../lib/sample-rule';

export default function SigmaTranslate() {
	const [rule, setRule] = useState(SAMPLE_SIGMA_RULE);
	const [target, setTarget] = useState<SigmaTarget>('splunk');
	const [output, setOutput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [converting, setConverting] = useState(false);
	const [statusText, setStatusText] = useState('Click Convert to load pySigma');
	const [ready, setReady] = useState(false);
	const [copied, setCopied] = useState(false);
	const [hasConverted, setHasConverted] = useState(false);

	useEffect(() => () => disposeSigmaConverter(), []);

	const handleConvert = useCallback(async () => {
		const trimmed = rule.trim();
		if (!trimmed) {
			setError('Paste a Sigma rule (YAML) to convert.');
			setOutput('');
			return;
		}

		setConverting(true);
		setError(null);
		setOutput('');
		setHasConverted(true);

		try {
			const result = await convertSigmaRule(trimmed, target, (status) => {
				setStatusText(formatEngineStatus(status));
				setReady(status.ready);
			});
			if (result.error) {
				setError(result.error);
			} else if (result.query) {
				setOutput(result.query);
			} else {
				setError('Conversion returned no output.');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Conversion failed.');
		} finally {
			setConverting(false);
		}
	}, [rule, target]);

	const handleCopy = async () => {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	const activeTarget = TARGETS.find((t) => t.id === target);

	return (
		<div className="sigma-lab">
			<div className="sigma-toolbar">
				<div className="target-picker" role="radiogroup" aria-label="Target SIEM backend">
					{TARGETS.map((option) => (
						<label
							key={option.id}
							className={`target-option${target === option.id ? ' selected' : ''}`}
						>
							<input
								type="radio"
								name="target"
								value={option.id}
								checked={target === option.id}
								onChange={() => setTarget(option.id)}
							/>
							<span className="target-label">{option.label}</span>
							<span className="target-hint">{option.hint}</span>
						</label>
					))}
				</div>

				<div className="toolbar-actions">
					<button
						type="button"
						className="btn secondary"
						onClick={() => setRule(SAMPLE_SIGMA_RULE)}
					>
						Load sample
					</button>
					<button
						type="button"
						className="btn primary"
						onClick={handleConvert}
						disabled={converting}
					>
						{converting ? 'Converting…' : 'Convert'}
					</button>
				</div>
			</div>

			<div className="sigma-panels">
				<div className="panel">
					<div className="panel-head">
						<h2>Sigma rule</h2>
						<span className="panel-tag">YAML</span>
					</div>
					<textarea
						className="rule-input"
						value={rule}
						onChange={(e) => setRule(e.target.value)}
						spellCheck={false}
						aria-label="Sigma rule YAML"
						placeholder="Paste a Sigma detection rule here…"
					/>
				</div>

				<div className="panel">
					<div className="panel-head">
						<h2>{activeTarget?.label ?? 'Output'}</h2>
						<div className="panel-head-actions">
							{output ? (
								<button type="button" className="btn ghost" onClick={handleCopy}>
									{copied ? 'Copied' : 'Copy'}
								</button>
							) : null}
						</div>
					</div>
					<pre
						className={`output${error ? ' has-error' : ''}${!output && !error ? ' empty' : ''}`}
						aria-live="polite"
					>
						{error ?? output ?? (hasConverted ? 'No output.' : 'Converted query appears here.')}
					</pre>
				</div>
			</div>

			<div className="status-bar" aria-live="polite">
				<span className={`status-dot${ready ? ' ready' : converting ? ' busy' : ''}`} />
				<span>{statusText}</span>
			</div>

			<p className="field-note">
				Sigma defaults to Sysmon-style field names like <code>Image</code> and{' '}
				<code>CommandLine</code>. Your SIEM may use ECS, CIM, or vendor-specific schemas.
				Verify and adjust field mappings before deploying a converted query.
			</p>

			<style>{`
				.sigma-lab {
					display: grid;
					gap: 1rem;
				}

				.sigma-toolbar {
					display: grid;
					gap: 1rem;
				}

				.target-picker {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
					gap: 0.65rem;
				}

				.target-option {
					display: grid;
					gap: 0.15rem;
					padding: 0.75rem 0.85rem;
					border: 1px solid var(--border);
					border-radius: 10px;
					background: var(--surface);
					cursor: pointer;
					transition: border-color 0.15s, background 0.15s;
				}

				.target-option input {
					position: absolute;
					opacity: 0;
					pointer-events: none;
				}

				.target-option.selected {
					border-color: rgba(63, 185, 80, 0.55);
					background: var(--accent-soft);
				}

				.target-label {
					font-weight: 600;
					font-size: 0.95rem;
				}

				.target-hint {
					color: var(--muted);
					font-size: 0.8rem;
				}

				.toolbar-actions {
					display: flex;
					flex-wrap: wrap;
					gap: 0.65rem;
				}

				.btn {
					border-radius: 8px;
					padding: 0.55rem 1rem;
					font-size: 0.92rem;
					font-weight: 600;
					cursor: pointer;
					border: 1px solid var(--border);
					background: var(--surface);
					color: var(--text);
				}

				.btn:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}

				.btn.primary {
					background: var(--accent);
					border-color: var(--accent);
					color: #0d1117;
				}

				.btn.secondary:hover,
				.btn.ghost:hover {
					border-color: var(--muted);
				}

				.btn.primary:hover:not(:disabled) {
					filter: brightness(1.05);
				}

				.btn.ghost {
					padding: 0.35rem 0.7rem;
					font-size: 0.82rem;
					background: transparent;
				}

				.sigma-panels {
					display: grid;
					gap: 1rem;
				}

				@media (min-width: 900px) {
					.sigma-panels {
						grid-template-columns: 1fr 1fr;
						align-items: stretch;
					}
				}

				.panel {
					display: grid;
					grid-template-rows: auto 1fr;
					border: 1px solid var(--border);
					border-radius: 12px;
					background: var(--surface);
					overflow: hidden;
					min-height: 320px;
				}

				.panel-head {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 0.75rem;
					padding: 0.75rem 1rem;
					border-bottom: 1px solid var(--border);
					background: var(--surface-raised);
				}

				.panel-head h2 {
					margin: 0;
					font-size: 0.95rem;
				}

				.panel-tag {
					font-size: 0.7rem;
					text-transform: uppercase;
					letter-spacing: 0.06em;
					color: var(--muted);
				}

				.panel-head-actions {
					display: flex;
					gap: 0.5rem;
				}

				.rule-input,
				.output {
					margin: 0;
					padding: 1rem;
					font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
					font-size: 0.82rem;
					line-height: 1.55;
					border: 0;
					background: transparent;
					color: var(--text);
					resize: vertical;
					min-height: 260px;
				}

				.rule-input {
					width: 100%;
					outline: none;
				}

				.rule-input:focus {
					box-shadow: inset 0 0 0 1px rgba(63, 185, 80, 0.45);
				}

				.output {
					white-space: pre-wrap;
					word-break: break-word;
					overflow: auto;
				}

				.output.empty {
					color: var(--muted);
				}

				.output.has-error {
					color: var(--critical);
				}

				.status-bar {
					display: flex;
					align-items: center;
					gap: 0.55rem;
					font-size: 0.85rem;
					color: var(--muted);
				}

				.status-dot {
					width: 0.55rem;
					height: 0.55rem;
					border-radius: 50%;
					background: var(--muted);
					flex-shrink: 0;
				}

				.status-dot.ready {
					background: var(--accent);
				}

				.status-dot.busy {
					background: var(--medium);
					animation: pulse 1s ease-in-out infinite;
				}

				@keyframes pulse {
					50% { opacity: 0.45; }
				}

				.field-note {
					margin: 0;
					color: var(--muted);
					font-size: 0.88rem;
					max-width: 72ch;
				}

				.field-note code {
					font-size: 0.85em;
					color: var(--text);
				}
			`}</style>
		</div>
	);
}
