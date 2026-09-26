/** llmstxt.org index of the site for AI agents. Prerendered (nuxt.config); see server/utils/site-docs.ts. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `${llmsTxt(await loadSite(event))}\n`
})
