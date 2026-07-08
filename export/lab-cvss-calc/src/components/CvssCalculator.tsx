import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	parseVector,
	score,
	type CvssMetrics,
	type CvssV31Metrics,
	type CvssV40Metrics,
	type CvssResult,
} from '@hailbytes/cvss-calc';
import {
	DEFAULT_V31,
	DEFAULT_V40,
	METRICS_V31,
	METRICS_V40,
	severityClass,
	type CvssVersion,
	type MetricGroup,
} from '../lib/cvss-metrics';

type MetricsState = CvssV31Metrics | CvssV40Metrics;

function metricsFromVector(vector: string): MetricsState | null {
	try {
		return parseVector(vector.trim());
	} catch {
		return null;
	}
}

function readHashVector(): string | null {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash.slice(1);
	if (!hash) return null;
	const params = new URLSearchParams(hash);
	return params.get('vector');
}

function writeHashVector(vector: string) {
	if (typeof window === 'undefined') return;
	const url = new URL(window.location.href);
	url.hash = `vector=${encodeURIComponent(vector)}`;
	window.history.replaceState(null, '', url.toString());
}

function MetricSelector({
	group,
	value,
	onChange,
}: {
	group: MetricGroup;
	value: string;
	onChange: (id: string, value: string) => void;
}) {
	const selected = group.options.find((o) => o.value === value);

	return (
		<fieldset className="metric-group">
			<legend>
				<span className="metric-name">{group.name}</span>
				<span className="metric-id">{group.id}</span>
			</legend>
			<p className="metric-desc">{group.desc}</p>
			<div className="metric-options" role="radiogroup" aria-label={group.name}>
				{group.options.map((option) => (
					<label
						key={option.value}
						className={`metric-option${value === option.value ? ' selected' : ''}`}
					>
						<input
							type="radio"
							name={group.id}
							value={option.value}
							checked={value === option.value}
							onChange={() => onChange(group.id, option.value)}
						/>
						<span className="option-label">{option.label}</span>
						<span className="option-hint">{option.hint}</span>
					</label>
				))}
			</div>
			{selected && <p className="metric-selected-hint">{selected.hint}</p>}
		</fieldset>
	);
}

export default function CvssCalculator() {
	const [version, setVersion] = useState<CvssVersion>('3.1');
	const [metrics, setMetrics] = useState<MetricsState>(DEFAULT_V31);
	const [pasteInput, setPasteInput] = useState('');
	const [pasteError, setPasteError] = useState('');
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const fromHash = readHashVector();
		if (!fromHash) return;
		const parsed = metricsFromVector(fromHash);
		if (parsed) {
			setVersion(parsed.version);
			setMetrics(parsed);
		}
	}, []);

	const result: CvssResult = useMemo(() => score(metrics as CvssMetrics), [metrics]);

	useEffect(() => {
		writeHashVector(result.vector);
	}, [result.vector]);

	const metricGroups = version === '3.1' ? METRICS_V31 : METRICS_V40;

	const handleVersionChange = (next: CvssVersion) => {
		setVersion(next);
		setMetrics(next === '3.1' ? { ...DEFAULT_V31 } : { ...DEFAULT_V40 });
		setPasteError('');
	};

	const handleMetricChange = (id: string, value: string) => {
		setMetrics((prev) => ({ ...prev, [id]: value }) as MetricsState);
		setPasteError('');
	};

	const handlePaste = () => {
		const parsed = metricsFromVector(pasteInput);
		if (!parsed) {
			setPasteError('Could not parse that vector. Use a CVSS:3.1 or CVSS:4.0 string.');
			return;
		}
		setVersion(parsed.version);
		setMetrics(parsed);
		setPasteInput('');
		setPasteError('');
	};

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(result.vector);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}, [result.vector]);

	const handleReset = () => {
		setMetrics(version === '3.1' ? { ...DEFAULT_V31 } : { ...DEFAULT_V40 });
		setPasteError('');
	};

	return (
		<div className="cvss-calc">
			<div className="score-panel">
				<div className="score-main">
					<span className="score-value" aria-live="polite">
						{result.score.toFixed(1)}
					</span>
					<span className={`severity-badge ${severityClass(result.severity)}`}>
						{result.severity}
					</span>
				</div>
				<p className="score-version">CVSS {result.version} base score</p>

				<div className="vector-row">
					<code className="vector-string" title={result.vector}>
						{result.vector}
					</code>
					<button type="button" className="btn btn-copy" onClick={handleCopy}>
						{copied ? 'Copied!' : 'Copy vector'}
					</button>
				</div>
			</div>

			<div className="controls-row">
				<div className="version-toggle" role="group" aria-label="CVSS version">
					{(['3.1', '4.0'] as const).map((v) => (
						<button
							key={v}
							type="button"
							className={`btn btn-version${version === v ? ' active' : ''}`}
							onClick={() => handleVersionChange(v)}
							aria-pressed={version === v}
						>
							CVSS {v}
						</button>
					))}
				</div>
				<button type="button" className="btn btn-ghost" onClick={handleReset}>
					Reset defaults
				</button>
			</div>

			<div className="paste-panel">
				<label htmlFor="paste-vector" className="paste-label">
					Paste a vector string
				</label>
				<div className="paste-row">
					<input
						id="paste-vector"
						type="text"
						className="paste-input"
						placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
						value={pasteInput}
						onChange={(e) => {
							setPasteInput(e.target.value);
							setPasteError('');
						}}
						onKeyDown={(e) => e.key === 'Enter' && handlePaste()}
					/>
					<button type="button" className="btn" onClick={handlePaste}>
						Load
					</button>
				</div>
				{pasteError && <p className="paste-error">{pasteError}</p>}
			</div>

			<div className="metrics-grid">
				{metricGroups.map((group) => (
					<MetricSelector
						key={group.id}
						group={group}
						value={(metrics as Record<string, string>)[group.id]}
						onChange={handleMetricChange}
					/>
				))}
			</div>

			<style>{`
				.cvss-calc {
					display: flex;
					flex-direction: column;
					gap: 1.5rem;
				}

				.score-panel {
					background: var(--surface);
					border: 1px solid var(--border);
					border-radius: 12px;
					padding: 1.25rem 1.5rem;
				}

				.score-main {
					display: flex;
					align-items: center;
					gap: 1rem;
					flex-wrap: wrap;
				}

				.score-value {
					font-size: clamp(3rem, 10vw, 4.5rem);
					font-weight: 700;
					line-height: 1;
					letter-spacing: -0.03em;
					font-variant-numeric: tabular-nums;
				}

				.severity-badge {
					font-size: 0.8rem;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.06em;
					padding: 0.35rem 0.75rem;
					border-radius: 999px;
					border: 1px solid transparent;
				}

				.severity-critical {
					color: var(--critical);
					background: rgba(248, 81, 73, 0.14);
					border-color: rgba(248, 81, 73, 0.4);
				}

				.severity-high {
					color: var(--high);
					background: rgba(219, 109, 40, 0.14);
					border-color: rgba(219, 109, 40, 0.4);
				}

				.severity-medium {
					color: var(--medium);
					background: rgba(210, 153, 34, 0.14);
					border-color: rgba(210, 153, 34, 0.4);
				}

				.severity-low {
					color: var(--low);
					background: rgba(63, 185, 80, 0.14);
					border-color: rgba(63, 185, 80, 0.4);
				}

				.severity-none {
					color: var(--none);
					background: rgba(145, 152, 161, 0.14);
					border-color: rgba(145, 152, 161, 0.35);
				}

				.score-version {
					color: var(--muted);
					margin: 0.5rem 0 1rem;
					font-size: 0.92rem;
				}

				.vector-row {
					display: flex;
					gap: 0.75rem;
					align-items: stretch;
					flex-wrap: wrap;
				}

				.vector-string {
					flex: 1;
					min-width: 0;
					background: var(--surface-raised);
					border: 1px solid var(--border);
					border-radius: 8px;
					padding: 0.65rem 0.85rem;
					font-size: 0.82rem;
					word-break: break-all;
					color: var(--text);
				}

				.controls-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 1rem;
					flex-wrap: wrap;
				}

				.version-toggle {
					display: flex;
					gap: 0.5rem;
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
					transition: opacity 0.15s ease;
				}

				.btn:hover {
					opacity: 0.9;
				}

				.btn-version {
					background: var(--surface);
					color: var(--muted);
					border: 1px solid var(--border);
				}

				.btn-version.active {
					background: var(--accent-soft);
					color: var(--accent);
					border-color: rgba(63, 185, 80, 0.45);
				}

				.btn-ghost {
					background: transparent;
					color: var(--muted);
					border: 1px solid var(--border);
				}

				.btn-copy {
					flex-shrink: 0;
					white-space: nowrap;
				}

				.paste-panel {
					background: var(--surface);
					border: 1px solid var(--border);
					border-radius: 10px;
					padding: 1rem 1.25rem;
				}

				.paste-label {
					display: block;
					font-weight: 600;
					margin-bottom: 0.5rem;
					font-size: 0.92rem;
				}

				.paste-row {
					display: flex;
					gap: 0.75rem;
					flex-wrap: wrap;
				}

				.paste-input {
					flex: 1;
					min-width: 200px;
					background: var(--surface-raised);
					border: 1px solid var(--border);
					border-radius: 8px;
					padding: 0.6rem 0.85rem;
					color: var(--text);
					font-size: 0.88rem;
					font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
				}

				.paste-input:focus {
					outline: 2px solid rgba(63, 185, 80, 0.45);
					outline-offset: 1px;
				}

				.paste-error {
					color: var(--critical);
					margin: 0.5rem 0 0;
					font-size: 0.88rem;
				}

				.metrics-grid {
					display: grid;
					gap: 1rem;
				}

				.metric-group {
					border: 1px solid var(--border);
					border-radius: 10px;
					padding: 1rem 1.25rem;
					margin: 0;
					background: var(--surface);
				}

				.metric-group legend {
					display: flex;
					align-items: baseline;
					gap: 0.5rem;
					padding: 0 0.25rem;
				}

				.metric-name {
					font-weight: 600;
					font-size: 0.98rem;
				}

				.metric-id {
					font-size: 0.75rem;
					color: var(--muted);
					font-family: ui-monospace, monospace;
					text-transform: uppercase;
				}

				.metric-desc {
					color: var(--muted);
					font-size: 0.88rem;
					margin: 0.25rem 0 0.85rem;
				}

				.metric-options {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
					gap: 0.5rem;
				}

				.metric-option {
					display: flex;
					flex-direction: column;
					gap: 0.15rem;
					padding: 0.65rem 0.75rem;
					border: 1px solid var(--border);
					border-radius: 8px;
					cursor: pointer;
					background: var(--surface-raised);
					transition: border-color 0.15s ease, background 0.15s ease;
				}

				.metric-option:hover {
					border-color: rgba(63, 185, 80, 0.45);
				}

				.metric-option.selected {
					border-color: var(--accent);
					background: var(--accent-soft);
				}

				.metric-option input {
					position: absolute;
					opacity: 0;
					pointer-events: none;
				}

				.option-label {
					font-weight: 600;
					font-size: 0.9rem;
				}

				.option-hint {
					font-size: 0.78rem;
					color: var(--muted);
					line-height: 1.35;
				}

				.metric-selected-hint {
					margin: 0.65rem 0 0;
					font-size: 0.82rem;
					color: var(--muted);
				}

				@media (min-width: 700px) {
					.metrics-grid {
						grid-template-columns: 1fr 1fr;
					}

					.metric-group:nth-child(5),
					.metric-group:nth-child(6),
					.metric-group:nth-child(7),
					.metric-group:nth-child(8) {
						grid-column: span 1;
					}
				}
			`}</style>
		</div>
	);
}
