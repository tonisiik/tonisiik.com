import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubdate: z.string().optional(),
    heroimage: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    project: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    revision: z.string().optional().nullable(),
    date_created: z.string().optional().nullable(),
    date_modified: z.string().optional().nullable(),
  })
});

export const collections = { projects };
