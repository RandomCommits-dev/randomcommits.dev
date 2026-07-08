import { zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

let initialized = false;

export function initZxcvbn(): void {
	if (initialized) return;

	zxcvbnOptions.setOptions({
		dictionary: {
			...zxcvbnCommonPackage.dictionary,
			...zxcvbnEnPackage.dictionary,
		},
		graphs: zxcvbnCommonPackage.adjacencyGraphs,
		translations: zxcvbnEnPackage.translations,
	});

	initialized = true;
}
