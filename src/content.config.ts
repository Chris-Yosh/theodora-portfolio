import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string().nullable(),
    date: z.coerce.date(),
    year: z.number(),
    disciplines: z.array(z.string()),
    tools: z.array(z.string()).default([]),
    color: z.enum(['peach', 'pink', 'butter', 'sage', 'sky', 'lilac']),
    featured: z.boolean().default(false),
    behance: z.string().url(),
    cover: z.string(),
    images: z.array(z.string()).default([]),
    videos: z
      .array(z.object({ id: z.string(), hash: z.string().optional(), title: z.string(), ratio: z.string().default('16 / 9'), duration: z.number().optional() }))
      .default([]),
  }),
});

export const collections = { projects };
