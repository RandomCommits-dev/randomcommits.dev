import { DICEWARE_WORDS } from './diceware-words';

function randomIndex(max: number): number {
	const array = new Uint32Array(1);
	let value = max;
	while (value >= 0xffff_ffff - (0xffff_ffff % max)) {
		crypto.getRandomValues(array);
		value = array[0];
	}
	return value % max;
}

export function generateDicewarePassphrase(wordCount: number, separator = '-'): string {
	const words: string[] = [];
	for (let i = 0; i < wordCount; i++) {
		words.push(DICEWARE_WORDS[randomIndex(DICEWARE_WORDS.length)]);
	}
	return words.join(separator);
}
