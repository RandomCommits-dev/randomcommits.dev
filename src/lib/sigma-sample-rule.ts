export const SAMPLE_SIGMA_RULE = `title: Whoami Execution
id: 12345678-1234-1234-1234-123456789012
status: test
description: Detects execution of whoami, often used by attackers for reconnaissance
references:
  - https://attack.mitre.org/techniques/T1033/
author: randomcommits.dev
date: 2026/07/08
tags:
  - attack.discovery
  - attack.t1033
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\\\whoami.exe'
    CommandLine|contains: 'whoami'
  condition: selection
falsepositives:
  - Legitimate administration and troubleshooting
level: low
`;

export type SigmaTarget = 'splunk' | 'lucene' | 'kusto';

export const TARGETS: { id: SigmaTarget; label: string; hint: string }[] = [
	{
		id: 'splunk',
		label: 'Splunk SPL',
		hint: 'Splunk Search Processing Language',
	},
	{
		id: 'lucene',
		label: 'Elastic / Lucene',
		hint: 'Elasticsearch Lucene query syntax',
	},
	{
		id: 'kusto',
		label: 'Microsoft KQL',
		hint: 'Kusto Query Language for Sentinel and Defender',
	},
];
