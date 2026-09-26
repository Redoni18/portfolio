// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = 'https://redonemini.com'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    'shadcn-nuxt',
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
  ],

  css: ['~/assets/css/main.css'],

  experimental: {
    // Client-side navigations run as view transitions. Which one (tab slide,
    // project title morph or none) is picked per navigation by
    // app/middleware/view-transition.global.ts; the CSS is in main.css.
    viewTransition: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // Fallback for the 404.html SPA shell; every page sets its own title.
      title: 'Redon Emini',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      // favicon.svg follows the system theme: dark tile with light letters in
      // light mode, the inverse in dark mode. It must be the last `icon` link:
      // browsers that support SVG favicons use the last one listed, and the
      // static .ico (dark tile) is only a fallback for those that don't.
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      // Override with NUXT_PUBLIC_GITHUB_USERNAME
      githubUsername: 'Redoni18',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'color-mode',
    // Don't animate every colour on the page when the theme flips
    disableTransition: true,
  },

  fonts: {
    defaults: {
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      { name: 'Geist', provider: 'google', global: true, weights: ['400 700'] },
      // Monospace role (dates, addresses, badges, code): MONO axis pinned to 1
      { name: 'Google Sans Code', provider: 'google', global: true, weights: ['400 600'] },
    ],
    google: {
      experimental: {
        variableAxis: {
          'Google Sans Code': { MONO: ['1'] },
        },
      },
    },
  },

  content: {
    renderer: {
      // `figure`, `video` and `kbd` are native HTML tags, so MDC would render them
      // as-is. Map them to our components (::figure, :figure, ::video, :kbd[…]).
      alias: {
        figure: 'ContentFigure',
        video: 'ContentVideo',
        kbd: 'ContentKbd',
      },
    },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 2 },
        highlight: {
          theme: {
            default: 'vitesse-light',
            dark: 'vitesse-dark',
          },
          langs: [
            'bash', 'shell', 'diff', 'dockerfile', 'go', 'graphql', 'hcl', 'html', 'css', 'scss',
            'js', 'jsx', 'ts', 'tsx', 'json', 'jsonc', 'md', 'mdc', 'python', 'rust', 'sql',
            'swift', 'toml', 'vue', 'yaml', 'ini', 'xml',
          ],
        },
      },
    },
    // Use Node's built-in `node:sqlite` at build time (Node >= 22.13) instead of
    // compiling `better-sqlite3`. Only used while building/prerendering.
    experimental: { sqliteConnector: 'native' },
  },

  nitro: {
    preset: 'cloudflare_pages',
    cloudflare: {
      // We ship our own wrangler.toml (with nodejs_compat); don't generate one.
      deployConfig: false,
      nodeCompat: true,
      pages: {
        // Only the API runs in the Pages Function. Everything else (all pages,
        // payloads, content dumps, fonts, assets) is static and served from the edge.
        defaultRoutes: false,
        routes: {
          version: 1,
          include: ['/api/*'],
          exclude: [],
        },
      },
    },
    prerender: {
      crawlLinks: true,
      // Write `/projects` as `projects.html` (not `projects/index.html`) so
      // Cloudflare Pages serves it without a trailing-slash redirect.
      autoSubfolderIndex: false,
      failOnError: true,
      // `/404.html` is rendered as an SPA shell; Cloudflare Pages serves it with
      // a 404 status for any unknown path.
      routes: ['/', '/experience', '/projects', '/404.html'],
    },
  },

  hooks: {
    // Nitro's cloudflare_pages preset writes `/* /404.html 404` to `_redirects`
    // when a 404.html exists, but Pages rejects 404 as a redirect status
    // ("invalid redirect rule"). Pages already serves the top-level 404.html
    // for unknown paths, so drop that line after the preset has written it.
    'nitro:init'(nitro) {
      nitro.hooks.hook('compiled', async () => {
        const { readFile, writeFile, rm } = await import('node:fs/promises')
        const { join } = await import('node:path')
        const file = join(nitro.options.output.dir, '_redirects')
        const current = await readFile(file, 'utf8').catch(() => null)
        if (current === null) return
        const kept = current.split('\n').filter(line => !/^\S+\s+\S+\s+404\s*$/.test(line.trim()))
        if (kept.some(line => line.trim())) await writeFile(file, kept.join('\n'))
        else await rm(file)
      })
    },
  },

  routeRules: {
    '/api/**': { prerender: false },
  },

  typescript: {
    strict: true,
  },
})
