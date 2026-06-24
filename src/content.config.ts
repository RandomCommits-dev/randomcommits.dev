import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ORG = 'RandomCommits-dev';

const notes = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		growth: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
		draft: z.boolean().default(false),
	}),
});

const repos = defineCollection({
	loader: async () => {
		try {
			const res = await fetch(
				`https://api.github.com/orgs/${ORG}/repos?per_page=100&sort=updated`,
				{
					headers: {
						Accept: 'application/vnd.github+json',
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': 'randomcommits.dev',
						// Anonymous = 60 req/hr. In CI we pass GITHUB_TOKEN (5000/hr).
						...(process.env.GITHUB_TOKEN
							? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
							: {}),
					},
				},
			);

			if (!res.ok) {
				console.warn(`[repos loader] GitHub API ${res.status}, falling back to empty list`);
				return [];
			}

			const data = await res.json();

			return data
				.filter(
					(r) =>
						!r.private && // never surface private repos on a public site
						!r.fork &&
						!r.archived &&
						r.name !== '.github',
					// To curate instead, opt in by uncommenting:
					// && (r.topics ?? []).includes('showcase'),
				)
				.map((r) => ({
					id: r.name,
					name: r.name,
					description: r.description ?? '',
					url: r.html_url,
					homepage: r.homepage ?? '',
					topics: r.topics ?? [],
					language: r.language ?? '',
					stars: r.stargazers_count ?? 0,
					updatedAt: r.updated_at,
				}));
		} catch (err) {
			console.warn('[repos loader] fetch failed, falling back to empty list', err);
			return [];
		}
	},
	schema: z.object({
		name: z.string(),
		description: z.string(),
		url: z.string().url(),
		homepage: z.string(),
		topics: z.array(z.string()),
		language: z.string(),
		stars: z.number(),
		updatedAt: z.string(),
	}),
});

export const collections = { notes, repos };
