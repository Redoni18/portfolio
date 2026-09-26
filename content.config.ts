import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM')

export default defineContentConfig({
  collections: {
    /** Site owner profile: header and links. `content/profile.yml` */
    profile: defineCollection({
      type: 'data',
      source: 'profile.yml',
      schema: z.object({
        name: z.string(),
        alias: z.string(),
        headline: z.string(),
        location: z.string(),
        email: z.string().email(),
        links: z.object({
          github: z.string().url(),
          linkedin: z.string().url(),
          twitch: z.string().url(),
        }),
        current: z.object({
          role: z.string(),
          company: z.string(),
          companyUrl: z.string().url().optional(),
        }),
      }),
    }),

    /** One file per role. `content/experience/*.yml` */
    experience: defineCollection({
      type: 'data',
      source: 'experience/*.yml',
      schema: z.object({
        company: z.string(),
        companyUrl: z.string().url().optional(),
        role: z.string(),
        location: z.string(),
        start: yearMonth,
        end: yearMonth.nullable().default(null),
        highlights: z.array(z.string()).default([]),
        stack: z.array(z.string()).default([]),
        order: z.number().default(0),
        /** Short contract work, listed after the employment history under "Consulting" */
        consulting: z.boolean().default(false),
      }),
    }),

    /** Intro prose on the home page. `content/about.md` */
    about: defineCollection({
      type: 'page',
      source: 'about.md',
    }),

    /**
     * Projects and their documentation pages.
     * - `projects/<slug>/index.md`       project overview (has the metadata below)
     * - `projects/<slug>/1.<page>.md`    doc sub-pages, ordered by numeric prefix
     */
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        year: z.union([z.string(), z.number()]).optional(),
        period: z.string().optional(),
        stack: z.array(z.string()).default([]),
        links: z.object({
          live: z.string().url().optional(),
          repo: z.string().url().optional(),
        }).default({}),
        featured: z.boolean().default(false),
        /** Side project or something built for an employer/client. Shown as a badge on /projects. */
        kind: z.enum(['personal', 'work']).default('personal'),
        order: z.number().default(999),
        /** Link-preview image (1200×630) for the projects list and social cards. */
        preview: z.object({
          src: z.string(),
          /** Optional variant shown instead of `src` in dark mode */
          srcDark: z.string().optional(),
          alt: z.string(),
          /** PNG/JPEG copy for og:image; not every social crawler reads WebP. Falls back to `src`. */
          og: z.string().optional(),
        }).optional(),
      }),
    }),
  },
})
