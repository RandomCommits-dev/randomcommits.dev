import type { CvssV31Metrics, CvssV40Metrics } from '@hailbytes/cvss-calc';

export type CvssVersion = '3.1' | '4.0';

export type MetricOption = {
	value: string;
	label: string;
	hint: string;
};

export type MetricGroup = {
	id: string;
	name: string;
	desc: string;
	options: MetricOption[];
};

export const DEFAULT_V31: CvssV31Metrics = {
	version: '3.1',
	AV: 'N',
	AC: 'L',
	PR: 'N',
	UI: 'N',
	S: 'U',
	C: 'L',
	I: 'L',
	A: 'N',
};

export const DEFAULT_V40: CvssV40Metrics = {
	version: '4.0',
	AV: 'N',
	AC: 'L',
	AT: 'N',
	PR: 'N',
	UI: 'N',
	VC: 'H',
	VI: 'H',
	VA: 'H',
	SC: 'N',
	SI: 'N',
	SA: 'N',
};

const impactOptions: MetricOption[] = [
	{ value: 'H', label: 'High', hint: 'Total loss or complete compromise' },
	{ value: 'L', label: 'Low', hint: 'Limited impact' },
	{ value: 'N', label: 'None', hint: 'No impact' },
];

export const METRICS_V31: MetricGroup[] = [
	{
		id: 'AV',
		name: 'Attack Vector',
		desc: 'How the vulnerability is exploited',
		options: [
			{ value: 'N', label: 'Network', hint: 'Exploitable over the network' },
			{ value: 'A', label: 'Adjacent', hint: 'Adjacent network or same broadcast domain' },
			{ value: 'L', label: 'Local', hint: 'Requires local access' },
			{ value: 'P', label: 'Physical', hint: 'Requires physical access' },
		],
	},
	{
		id: 'AC',
		name: 'Attack Complexity',
		desc: 'Conditions beyond the attacker\'s control',
		options: [
			{ value: 'L', label: 'Low', hint: 'No special conditions' },
			{ value: 'H', label: 'High', hint: 'Specialized access or race conditions' },
		],
	},
	{
		id: 'PR',
		name: 'Privileges Required',
		desc: 'Level of privileges needed before attack',
		options: [
			{ value: 'N', label: 'None', hint: 'No privileges required' },
			{ value: 'L', label: 'Low', hint: 'Basic user capabilities' },
			{ value: 'H', label: 'High', hint: 'Admin or elevated privileges' },
		],
	},
	{
		id: 'UI',
		name: 'User Interaction',
		desc: 'Whether a user must participate',
		options: [
			{ value: 'N', label: 'None', hint: 'No user interaction' },
			{ value: 'R', label: 'Required', hint: 'Victim must take action' },
		],
	},
	{
		id: 'S',
		name: 'Scope',
		desc: 'Whether impact stays within the vulnerable component',
		options: [
			{ value: 'U', label: 'Unchanged', hint: 'Impact limited to the component' },
			{ value: 'C', label: 'Changed', hint: 'Impact can escape the component' },
		],
	},
	{
		id: 'C',
		name: 'Confidentiality',
		desc: 'Impact on confidentiality of information',
		options: impactOptions,
	},
	{
		id: 'I',
		name: 'Integrity',
		desc: 'Impact on integrity of information',
		options: impactOptions,
	},
	{
		id: 'A',
		name: 'Availability',
		desc: 'Impact on availability of the component',
		options: impactOptions,
	},
];

export const METRICS_V40: MetricGroup[] = [
	{
		id: 'AV',
		name: 'Attack Vector',
		desc: 'How the vulnerability is exploited',
		options: [
			{ value: 'N', label: 'Network', hint: 'Exploitable over the network' },
			{ value: 'A', label: 'Adjacent', hint: 'Adjacent network' },
			{ value: 'L', label: 'Local', hint: 'Requires local access' },
			{ value: 'P', label: 'Physical', hint: 'Requires physical access' },
		],
	},
	{
		id: 'AC',
		name: 'Attack Complexity',
		desc: 'Conditions beyond the attacker\'s control',
		options: [
			{ value: 'L', label: 'Low', hint: 'No special conditions' },
			{ value: 'H', label: 'High', hint: 'Specialized conditions required' },
		],
	},
	{
		id: 'AT',
		name: 'Attack Requirements',
		desc: 'Prerequisites for a successful attack',
		options: [
			{ value: 'N', label: 'None', hint: 'No additional requirements' },
			{ value: 'P', label: 'Present', hint: 'Deployment or execution conditions apply' },
		],
	},
	{
		id: 'PR',
		name: 'Privileges Required',
		desc: 'Level of privileges needed before attack',
		options: [
			{ value: 'N', label: 'None', hint: 'No privileges required' },
			{ value: 'L', label: 'Low', hint: 'Basic user capabilities' },
			{ value: 'H', label: 'High', hint: 'Admin or elevated privileges' },
		],
	},
	{
		id: 'UI',
		name: 'User Interaction',
		desc: 'Whether a user must participate',
		options: [
			{ value: 'N', label: 'None', hint: 'No user interaction' },
			{ value: 'P', label: 'Passive', hint: 'User is a passive recipient' },
			{ value: 'A', label: 'Active', hint: 'User must take deliberate action' },
		],
	},
	{
		id: 'VC',
		name: 'Vulnerable System Confidentiality',
		desc: 'Confidentiality impact on the vulnerable system',
		options: impactOptions,
	},
	{
		id: 'VI',
		name: 'Vulnerable System Integrity',
		desc: 'Integrity impact on the vulnerable system',
		options: impactOptions,
	},
	{
		id: 'VA',
		name: 'Vulnerable System Availability',
		desc: 'Availability impact on the vulnerable system',
		options: impactOptions,
	},
	{
		id: 'SC',
		name: 'Subsequent System Confidentiality',
		desc: 'Confidentiality impact on other systems',
		options: impactOptions,
	},
	{
		id: 'SI',
		name: 'Subsequent System Integrity',
		desc: 'Integrity impact on other systems',
		options: impactOptions,
	},
	{
		id: 'SA',
		name: 'Subsequent System Availability',
		desc: 'Availability impact on other systems',
		options: impactOptions,
	},
];

export function severityClass(severity: string): string {
	switch (severity) {
		case 'Critical':
			return 'severity-critical';
		case 'High':
			return 'severity-high';
		case 'Medium':
			return 'severity-medium';
		case 'Low':
			return 'severity-low';
		default:
			return 'severity-none';
	}
}
