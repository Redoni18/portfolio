/**
 * Markdown copies of the pages for AI agents: `/experience.md`,
 * `/projects/clairwire.md`, `/index.html.md` for the home page (llmstxt.org).
 * They're prerendered as static files (app.vue queues them), so in production
 * this only ever runs at build time. A middleware rather than a route because a
 * catch-all route would shadow the Vue pages in `nuxt dev`. Anything else, and
 * unknown .md paths, falls through to the normal 404.
 */
export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.endsWith('.md')) return

  const page = findMarkdownPage(await loadSite(event), pathname)
  if (!page) return

  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return `${page.markdown}\n`
})
