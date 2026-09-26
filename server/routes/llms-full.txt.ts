/** Every page of the site as markdown, in one file. Prerendered (nuxt.config); see server/utils/site-docs.ts. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `${llmsFullTxt(await loadSite(event))}\n`
})
