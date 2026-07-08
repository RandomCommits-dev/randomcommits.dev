import { SigmaConverter, type EngineStatus } from '@northsh/pysigma-node';
import type { SigmaTarget } from './sigma-sample-rule';

let converter: SigmaConverter | null = null;
let worker: Worker | null = null;
let warmedTarget: SigmaTarget | null = null;
let warmingTarget: SigmaTarget | null = null;
let warmupPromise: Promise<{ success: boolean; error?: string }> | null = null;

const statusListeners = new Set<(status: EngineStatus) => void>();

function notifyStatus(status: EngineStatus): void {
	for (const listener of statusListeners) {
		listener(status);
	}
}

function createConverter(): SigmaConverter {
	if (typeof window === 'undefined') {
		throw new Error('Sigma conversion is only available in the browser');
	}

	worker = new Worker(new URL('@northsh/pysigma-node/worker', import.meta.url), {
		type: 'module',
	});

	return new SigmaConverter({
		worker,
		pipelinePackages: [],
		onStatus: notifyStatus,
	});
}

export function getSigmaConverter(): SigmaConverter {
	if (!converter) {
		converter = createConverter();
	}
	return converter;
}

export function subscribeEngineStatus(listener: (status: EngineStatus) => void): () => void {
	statusListeners.add(listener);
	return () => statusListeners.delete(listener);
}

export async function warmupEngine(
	target: SigmaTarget,
): Promise<{ success: boolean; error?: string }> {
	if (warmedTarget === target && getSigmaConverter().isReady()) {
		return { success: true };
	}

	if (warmupPromise && warmingTarget === target) {
		return warmupPromise;
	}

	warmingTarget = target;
	warmupPromise = (async () => {
		const engine = getSigmaConverter();
		const result = await engine.installBackend(target);
		if (result.success) {
			warmedTarget = target;
		}
		return result;
	})();

	try {
		return await warmupPromise;
	} finally {
		warmupPromise = null;
		warmingTarget = null;
	}
}

export async function convertSigmaRule(
	rule: string,
	target: SigmaTarget,
): Promise<{ query: string | null; error: string | null }> {
	const warmup = await warmupEngine(target);
	if (!warmup.success) {
		return { query: null, error: warmup.error ?? 'Failed to load conversion backend.' };
	}

	const { query, error } = await getSigmaConverter().convert(rule, target);

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
	warmedTarget = null;
	warmingTarget = null;
	warmupPromise = null;
	statusListeners.clear();
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
