import { parsePost } from './frontmatter.js';
import type { Post } from './types.js';

const SAMPLE_SOURCE = `---
title: "Hello World"
date: 2025-04-15
tags: [intro, demo]
draft: false
---

# Welcome

Body text.`;

export const samplePost: Post = parsePost(SAMPLE_SOURCE);

export const draftPostSource = `---
title: WIP
draft: true
---
body`;

export const noFrontmatterSource = '# Just a heading\n\nNo front-matter here.';
