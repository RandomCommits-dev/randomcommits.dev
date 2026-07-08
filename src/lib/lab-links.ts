import type { LabIdea } from '../data/lab-sections';

const ORG = 'https://github.com/RandomCommits-dev';

export function ideaHref(idea: LabIdea): string {
	if (idea.href) return idea.href;
	return `${ORG}/${idea.repo}`;
}
