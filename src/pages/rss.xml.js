import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	return rss({
		title: 'randomcommits.dev · garden',
		description: 'Notes, TILs, and half-baked ideas from randomcommits.dev.',
		site: context.site,
		items: notes.map((note) => ({
			title: note.data.title,
			description: note.data.description ?? '',
			pubDate: note.data.pubDate,
			categories: note.data.tags,
			link: `/garden/${note.id}/`,
		})),
	});
}
