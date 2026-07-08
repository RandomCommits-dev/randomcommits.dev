/** Shannon entropy from the character pools present in a password. */
export function charsetEntropy(password: string): number {
	if (!password) return 0;

	let pool = 0;
	if (/[a-z]/.test(password)) pool += 26;
	if (/[A-Z]/.test(password)) pool += 26;
	if (/[0-9]/.test(password)) pool += 10;
	if (/[^a-zA-Z0-9]/.test(password)) pool += 33;

	return password.length * Math.log2(pool);
}

/** Entropy for a diceware passphrase: log2(wordlist^wordCount). */
export function dicewareEntropy(wordCount: number, listSize: number): number {
	if (wordCount <= 0 || listSize <= 1) return 0;
	return wordCount * Math.log2(listSize);
}

/** Map crack-time seconds to a 0–100 meter fill (log scale). */
export function crackTimeMeterPercent(seconds: number): number {
	if (!Number.isFinite(seconds) || seconds <= 0) return 0;

	const minLog = 0; // 1 second
	const maxLog = 18; // ~31 years at log10 scale upper bound for display
	const value = Math.log10(Math.max(1, seconds));
	const percent = ((value - minLog) / (maxLog - minLog)) * 100;
	return Math.min(100, Math.max(2, percent));
}

export const SCORE_LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const;

export function scoreClass(score: number): string {
	switch (score) {
		case 0:
			return 'score-0';
		case 1:
			return 'score-1';
		case 2:
			return 'score-2';
		case 3:
			return 'score-3';
		default:
			return 'score-4';
	}
}
