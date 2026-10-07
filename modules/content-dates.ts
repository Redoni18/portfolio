import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { addServerTemplate, addTypeTemplate, defineNuxtModule, useLogger } from '@nuxt/kit'

/**
 * The last commit date of every file under content/, for the sitemap's
 * <lastmod>. Server code imports it as `#content-dates`:
 * `{ 'projects/clairwire/index.md': '2026-09-27T00:49:01+02:00', … }`.
 *
 * Cloudflare Pages builds from a shallow clone (only the commit being built),
 * so there the rest of the history is fetched first; the repo is public, so
 * no credentials are needed.
 *
 * It's empty when there's no usable git history: no repo, or a shallow clone
 * that couldn't be (or, outside Pages, isn't) deepened, where every file would
 * get the date of the one commit that was fetched. The sitemap then leaves
 * <lastmod> out rather than give a wrong date.
 */
export default defineNuxtModule({
  meta: { name: 'content-dates' },
  setup(_, nuxt) {
    const logger = useLogger('content-dates')

    addServerTemplate({
      filename: '#content-dates',
      getContents() {
        const dates = readContentDates(join(nuxt.options.rootDir, 'content'))
        if (!Object.keys(dates).length) logger.warn('No git history for content/, so the sitemap has no <lastmod> dates.')
        return `export default ${JSON.stringify(dates)}`
      },
    })

    // Declared for the app too: the app's typed routes pull server files into its type check
    addTypeTemplate({
      filename: 'types/content-dates.d.ts',
      getContents: () => [
        `declare module '#content-dates' {`,
        `  /** Last commit date (ISO 8601) by path relative to content/ */`,
        `  const dates: Record<string, string>`,
        `  export default dates`,
        `}`,
      ].join('\n'),
    }, { nitro: true, nuxt: true })
  },
})

function readContentDates(contentDir: string): Record<string, string> {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: contentDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60_000 })
  const isShallow = () => git('rev-parse', '--is-shallow-repository').trim() === 'true'
  try {
    // Only on Pages (CF_PAGES=1): a local shallow clone is left as it is.
    // Fetching the built commit by hash also works for preview branches.
    if (isShallow() && process.env.CF_PAGES) git('fetch', '--unshallow', '--quiet', 'origin', git('rev-parse', 'HEAD').trim())
    if (isShallow()) return {}

    // Newest commit first, so the first date seen for a file is its latest.
    // `--relative` makes the file names relative to content/.
    const dates: Record<string, string> = {}
    for (const commit of git('log', '--format=%x00%cI', '--name-only', '--relative', '--', '.').split('\0')) {
      const [date, ...files] = commit.split('\n').map(line => line.trim()).filter(Boolean)
      if (!date) continue
      for (const file of files) dates[file] ??= date
    }
    return dates
  }
  catch {
    return {}
  }
}
