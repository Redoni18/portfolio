/** Every page, with the date its content last changed. Prerendered (nuxt.config); see server/utils/site-docs.ts. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return sitemapXml(await loadSite(event))
})
