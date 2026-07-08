// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://randomcommits-dev.github.io',
	base: '/lab-pw-entropy',
	integrations: [react()],
});
