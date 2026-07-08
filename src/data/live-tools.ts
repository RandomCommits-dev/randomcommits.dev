export type LiveTool = {
	title: string;
	description: string;
	gardenHref: string;
	repo: string;
};

/** Browser lab tools shipped as interactive garden notes. */
export const liveTools: LiveTool[] = [
	{
		title: 'Password entropy, made visible',
		description:
			'Analyze password strength with zxcvbn and real entropy math, or generate a diceware passphrase.',
		gardenHref: '/garden/password-entropy/',
		repo: 'lab-pw-entropy',
	},
	{
		title: 'CVSS scoring, without the spreadsheet',
		description: 'Score CVSS 3.1 and 4.0 base metrics in your browser.',
		gardenHref: '/garden/cvss-calculator/',
		repo: 'lab-cvss-calc',
	},
	{
		title: 'Sigma rules, translated in the browser',
		description: 'Convert Sigma detection rules to Splunk SPL, Elastic Lucene, or Microsoft KQL.',
		gardenHref: '/garden/sigma-translate/',
		repo: 'lab-sigma-translate',
	},
];
