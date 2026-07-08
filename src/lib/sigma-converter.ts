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

	const engine = new SigmaConverter({
		worker,
		pipelinePackages: [],
	});

	// Worker mode does not forward constructor onStatus; subscribe explicitly.
	engine.addStatusListener(notifyStatus);

	return engine;
}

export function getSigmaConverter(): SigmaConverter {
	if (!converter) {
		converter = createConverter();
	}
	return converter;
}

export function subscribeEngineStatus(listener: (status: EngineStatus) => void): () => void {
	statusListeners.add(listener);
	if (converter) {
		listener(converter.getStatus());
	}
	return () => statusListeners.delete(listener);
}

export async function warmupEngine(
	target: SigmaTarget,
): Promise<{ success: boolean; error?: string }> {
	const engine = getSigmaConverter();

	if (warmedTarget === target && engine.isReady()) {
		notifyStatus(engine.getStatus());
		return { success: true };
	}

	if (warmupPromise && warmingTarget === target) {
		return warmupPromise;
	}

	warmingTarget = target;
	warmupPromise = (async () => {
		const result = await engine.installBackend(target);
		if (result.success) {
			warmedTarget = target;
			notifyStatus(engine.getStatus());
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
	if (status.error) {
		return status.error;
	}
	if (status.ready) {
		return 'Ready';
	}
	if (status.pyodideReady) {
		return 'Loading SIEM backend…';
	}
	return 'Loading conversion engine…';
}
