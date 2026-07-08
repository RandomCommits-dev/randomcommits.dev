import { SigmaConverter, type EngineStatus } from '@northsh/pysigma-node';
import type { SigmaTarget } from './sample-rule';

let converter: SigmaConverter | null = null;
let worker: Worker | null = null;

function createConverter(onStatus: (status: EngineStatus) => void): SigmaConverter {
	if (typeof window === 'undefined') {
		throw new Error('Sigma conversion is only available in the browser');
	}

	worker = new Worker(new URL('@northsh/pysigma-node/worker', import.meta.url), {
		type: 'module',
	});

	return new SigmaConverter({
		worker,
		onStatus,
	});
}

export function getSigmaConverter(onStatus: (status: EngineStatus) => void): SigmaConverter {
	if (!converter) {
		converter = createConverter(onStatus);
	}
	return converter;
}

export async function convertSigmaRule(
	rule: string,
	target: SigmaTarget,
	onStatus: (status: EngineStatus) => void,
): Promise<{ query: string | null; error: string | null }> {
	const engine = getSigmaConverter(onStatus);
	const { query, error } = await engine.convert(rule, target);

	if (error) {
		return { query: null, error };
	}

	return { query: query ?? null, error: null };
}

export function disposeSigmaConverter(): void {
	converter?.dispose();
	converter = null;
	worker?.terminate();
	worker = null;
}

export function formatEngineStatus(status: EngineStatus): string {
	if (status.phase === 'idle' && status.ready) {
		return 'Ready';
	}

	const parts: string[] = [];
	if (status.phase) parts.push(status.phase);
	if (status.message) parts.push(status.message);
	if (status.progress != null && status.progress > 0 && status.progress < 100) {
		parts.push(`${Math.round(status.progress)}%`);
	}

	return parts.join(' · ') || 'Loading conversion engine…';
}
