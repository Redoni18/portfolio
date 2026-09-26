import type { MaybeRefOrGetter } from 'vue'

export type SchemaNode = Record<string, unknown>

/** `@id`s that tie the nodes on every page to the same person and site. */
export function schemaIds(siteUrl: string) {
  return {
    person: `${siteUrl}/#person`,
    website: `${siteUrl}/#website`,
  }
}

/**
 * The page's schema.org JSON-LD, as one `@graph`: the Person the site is about
 * and the WebSite on every page, plus the nodes the page passes in (a
 * ProfilePage, an Article…), which can point at the person by `@id`.
 *
 * Search engines, and the AI assistants that search through them, read this to
 * tie the site to one person: name and alias, current role and employer,
 * location, the stack used day to day, and the GitHub/LinkedIn/Twitch profiles
 * that are the same person (`sameAs`).
 */
export function useStructuredData(pageNodes: MaybeRefOrGetter<SchemaNode[]> = []): Promise<void> {
  const siteUrl = useRuntimeConfig().public.siteUrl
  const ids = schemaIds(siteUrl)

  // Every composable is called before anything is awaited: after an `await`
  // inside a composable the Nuxt instance is gone. The page awaits the returned
  // promise instead, so the data is there when it renders.
  const profileData = useProfile()
  // The stack of the current role(s), as `knowsAbout`. Only the merged list ends up in the payload.
  const stackData = useAsyncData('structured-data:current-stack', async () => {
    const roles = await queryCollection('experience').select('stack', 'end', 'consulting').all()
    return [...new Set(roles.filter(role => !role.end && !role.consulting).flatMap(role => role.stack))]
  })
  const profile = profileData.data
  const currentStack = stackData.data

  const graph = computed<SchemaNode[]>(() => {
    const nodes: SchemaNode[] = []
    const me = profile.value
    if (me) {
      const [locality, ...rest] = me.location.split(',').map(part => part.trim())
      nodes.push({
        '@type': 'Person',
        '@id': ids.person,
        'name': me.name,
        'alternateName': me.alias,
        'url': `${siteUrl}/`,
        'email': me.email,
        'jobTitle': me.current.role,
        'worksFor': { '@type': 'Organization', 'name': me.current.company, 'url': me.current.companyUrl },
        'address': rest.length
          ? { '@type': 'PostalAddress', 'addressLocality': locality, 'addressCountry': rest.at(-1) }
          : undefined,
        'knowsAbout': currentStack.value?.length ? currentStack.value : undefined,
        'sameAs': Object.values(me.links),
      })
      // Google Search shows this `name` as the site name next to the favicon in results
      nodes.push({
        '@type': 'WebSite',
        '@id': ids.website,
        'url': `${siteUrl}/`,
        'name': me.name,
        'inLanguage': 'en',
        'author': { '@id': ids.person },
        'publisher': { '@id': ids.person },
      })
    }
    return [...nodes, ...toValue(pageNodes)]
  })

  useHead({
    script: computed(() => graph.value.length
      ? [{
          key: 'structured-data',
          type: 'application/ld+json',
          // unhead escapes `<` in JSON scripts, so content can't close the tag early
          textContent: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph.value }),
        }]
      : []),
  })

  return Promise.all([profileData, stackData]).then(() => undefined)
}
