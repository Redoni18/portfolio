import type { H3Event } from 'h3'
import type { ContributionsResponse } from '#shared/types/github'

/**
 * GitHub contributions calendar, cached in two layers:
 *
 * 1. Cloudflare's Workers Cache API (`caches.default`), per data centre, 6 h.
 *    Pages Functions responses are not CDN-cached just because of their
 *    `Cache-Control`, so this is what actually keeps GitHub from being hit on
 *    every request. Skipped when the Cache API doesn't exist (Node / `nuxt dev`).
 * 2. Nitro's cache (`defineCachedEventHandler`), per isolate, 6 h + SWR.
 *
 * The response carries `x-contrib-cache: hit | miss | bypass` (bypass = no Cache API).
 * Failures return 502 and are never cached.
 */

/** Sent to browsers. `s-maxage` is informational here; the edge TTL comes from the Cache API entry. */
const BROWSER_CACHE_CONTROL = 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'

const SIX_HOURS = 60 * 60 * 6
const ONE_DAY = 60 * 60 * 24
/** Bump to invalidate every edge-cached entry after a response shape change. */
const EDGE_CACHE_VERSION = 'v1'

interface EdgeCache {
  match: (request: Request) => Promise<Response | undefined>
  put: (request: Request, response: Response) => Promise<void>
}

function getEdgeCache(): EdgeCache | undefined {
  // `caches.default` only exists on Cloudflare Workers / workerd.
  const storage = (globalThis as { caches?: { default?: EdgeCache } }).caches
  return storage?.default
}

/** Run `promise` after the response is sent when the platform allows it. */
function runInBackground(event: H3Event, promise: Promise<unknown>) {
  const waitUntil = event.waitUntil
    ?? (event.context.cloudflare?.context as { waitUntil?: (p: Promise<unknown>) => void } | undefined)?.waitUntil
  if (waitUntil) waitUntil(promise)
  else return promise
}

function getUsername(): string {
  const name = String(useRuntimeConfig().public.githubUsername || 'Redoni18')
  // GitHub usernames: alphanumerics and single hyphens, max 39 chars.
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(name)) {
    throw new Error(`Invalid GitHub username: ${name}`)
  }
  return name
}

const cachedContributions = defineCachedEventHandler(
  async (): Promise<ContributionsResponse> => {
    const username = getUsername()
    const html = await $fetch<string>(`https://github.com/users/${username}/contributions`, {
      responseType: 'text',
      timeout: 10_000,
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'redonemini.com (+https://redonemini.com)',
      },
    })
    const { total, weeks } = parseContributionsHtml(html)
    return { total, weeks, fetchedAt: new Date().toISOString() }
  },
  {
    name: 'github-contributions',
    getKey: () => getUsername(),
    maxAge: SIX_HOURS,
    staleMaxAge: ONE_DAY,
    swr: true,
  },
)

function sendUnavailable(event: H3Event, error: unknown) {
  console.error('[github] contributions fetch failed:', error instanceof Error ? error.message : error)
  setResponseStatus(event, 502, 'Bad Gateway')
  setResponseHeader(event, 'cache-control', 'no-store')
  return { error: 'github_unavailable', message: 'Could not load GitHub contributions.' }
}

export default defineEventHandler(async (event) => {
  let username: string
  try {
    username = getUsername()
  }
  catch (error) {
    return sendUnavailable(event, error)
  }

  const edge = getEdgeCache()
  // Synthetic key on the request's own origin (entries are scoped per zone anyway).
  const cacheKey = edge
    ? new Request(new URL(`/__edge-cache/github-contributions/${EDGE_CACHE_VERSION}/${username}`, getRequestURL(event).origin).toString())
    : undefined

  // 1) Edge cache
  if (edge && cacheKey) {
    const hit = await edge.match(cacheKey).catch(() => undefined)
    if (hit) {
      const etag = hit.headers.get('etag')
      setResponseHeaders(event, {
        'content-type': 'application/json',
        'cache-control': BROWSER_CACHE_CONTROL,
        'x-contrib-cache': 'hit',
        ...(etag ? { etag } : {}),
      })
      if (etag && getRequestHeader(event, 'if-none-match') === etag) {
        return sendNoContent(event, 304)
      }
      return hit.text()
    }
  }

  // 2) Nitro cache → GitHub
  let body: ContributionsResponse | undefined
  try {
    body = await cachedContributions(event)
  }
  catch (error) {
    return sendUnavailable(event, error)
  }
  // Nitro already answered a conditional request with 304.
  if (event.handled || !body) return

  const payload = JSON.stringify(body)
  const etag = getResponseHeader(event, 'etag')
  setResponseHeaders(event, {
    'content-type': 'application/json',
    // Replace the cache-control Nitro's cache wrote.
    'cache-control': BROWSER_CACHE_CONTROL,
    'x-contrib-cache': edge ? 'miss' : 'bypass',
  })

  if (edge && cacheKey) {
    const stored = new Response(payload, {
      headers: {
        'content-type': 'application/json',
        'cache-control': `public, s-maxage=${SIX_HOURS}`,
        ...(etag ? { etag: String(etag) } : {}),
      },
    })
    await runInBackground(
      event,
      edge.put(cacheKey, stored).catch(error => console.error('[github] edge cache put failed:', error)),
    )
  }

  return payload
})
