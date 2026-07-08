const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30.44 * DAY;
const YEAR = 365.25 * DAY;
const CENTURY = 100 * YEAR;

export function formatCrackTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 1) return 'less than a second';
	if (seconds < MINUTE) return `${Math.round(seconds)} second${seconds === 1 ? '' : 's'}`;
	if (seconds < HOUR) {
		const m = Math.round(seconds / MINUTE);
		return `${m} minute${m === 1 ? '' : 's'}`;
	}
	if (seconds < DAY) {
		const h = Math.round(seconds / HOUR);
		return `${h} hour${h === 1 ? '' : 's'}`;
	}
	if (seconds < MONTH) {
		const d = Math.round(seconds / DAY);
		return `${d} day${d === 1 ? '' : 's'}`;
	}
	if (seconds < YEAR) {
		const mo = Math.round(seconds / MONTH);
		return `${mo} month${mo === 1 ? '' : 's'}`;
	}
	if (seconds < CENTURY) {
		const y = Math.round(seconds / YEAR);
		return `${y} year${y === 1 ? '' : 's'}`;
	}
	if (seconds < 100 * CENTURY) {
		const c = Math.round(seconds / CENTURY);
		return `${c} centur${c === 1 ? 'y' : 'ies'}`;
	}
	return 'centuries+';
}

export function formatBits(bits: number): string {
	if (!Number.isFinite(bits) || bits <= 0) return '0 bits';
	return `${bits.toFixed(1)} bits`;
}
