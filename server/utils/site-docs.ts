import type { H3Event } from 'h3'
import type { AboutCollectionItem, ExperienceCollectionItem, ProfileCollectionItem, ProjectsCollectionItem } from '@nuxt/content'
// Imported explicitly: the app's typed routes pull this file into the app's
// type check as well, where the auto-imported `queryCollection` is the client one.
import { queryCollection } from '@nuxt/content/server'
import contentDates from '#content-dates'

/**
 * Everything on the site as plain text, for AI agents, crawlers and anything
 * else that doesn't want to parse HTML. Built from the same content collections
 * as the pages, and prerendered into static files (see nuxt.config):
 *
 * - /llms.txt        a short index (llmstxt.org): who Redon is, work history, links to every page
 * - /llms-full.txt   every page in one file
 * - /<page>.md       one markdown copy per page (/index.html.md for the home page)
 * - /sitemap.xml     every page, with the date its content last changed
 */

export interface SitePage {
  /** Route of the HTML page, e.g. `/projects/clairwire` */
  path: string
  title: string
  /** One line describing the page, for llms.txt */
  summary: string
  markdown: string
  /** Last commit date of the content behind the page, when git history is available */
  lastmod?: string
}

interface Project {
  overview: ProjectsCollectionItem
  /** Overview first, then the write-up's pages in reading order */
  docs: ProjectsCollectionItem[]
}

export interface Site {
  url: string
  profile: ProfileCollectionItem
  about: AboutCollectionItem
  roles: ExperienceCollectionItem[]
  projects: Project[]
  /** About, Experience, Projects, then every project page, in site order */
  pages: SitePage[]
}

export async function loadSite(event: H3Event): Promise<Site> {
  const [profile, about, roles, projectItems] = await Promise.all([
    queryCollection(event, 'profile').first(),
    queryCollection(event, 'about').first(),
    queryCollection(event, 'experience').all(),
    queryCollection(event, 'projects').all(),
  ])
  if (!profile || !about) {
    throw createError({ statusCode: 500, statusMessage: 'content/profile.yml or content/about.md is missing' })
  }

  const projects = sortProjects(projectItems.filter(item => isProjectIndexPath(item.path)))
    .map(overview => ({
      overview,
      docs: sortProjectDocs(projectItems.filter(item => item.path === overview.path || item.path.startsWith(`${overview.path}/`)), overview.path),
    }))

  const site: Site = {
    url: useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, ''),
    profile,
    about,
    roles: sortRoles(roles),
    projects,
    pages: [],
  }
  site.pages = [
    aboutPage(site),
    experiencePage(site),
    projectsPage(site),
    ...projects.flatMap(project => project.docs.map(doc => projectDocPage(site, project, doc))),
  ]
  return site
}

/** The markdown copy served at `path`, like `/projects/clairwire.md`. */
export function findMarkdownPage(site: Site, path: string): SitePage | undefined {
  return site.pages.find(page => markdownPath(page.path) === path)
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export function llmsTxt(site: Site): string {
  const [about, experience, projectsIndex, ...projectPages] = site.pages
  const entry = (page: SitePage | undefined) => page ? `- [${page.title}](${site.url}${markdownPath(page.path)}): ${page.summary}` : ''

  return lines(
    `# ${site.profile.name}`,
    '',
    site.about.description ? `> ${site.about.description}` : '',
    '',
    profileFacts(site),
    '',
    bodyToMarkdown(site.about.body, { siteUrl: site.url, pageUrl: `${site.url}/` }),
    '',
    'Work history, most recent first:',
    '',
    ...workHistory(site),
    '',
    `Each link below is the markdown copy of a page on ${host(site)}. The same page as HTML is at that address without \`.md\` (and the home page is ${site.url}/).`,
    '',
    '## Pages',
    '',
    entry(about),
    entry(experience),
    entry(projectsIndex),
    '',
    '## Projects',
    '',
    ...projectPages.map(entry),
    '',
    '## Optional',
    '',
    `- [Full site content](${site.url}/llms-full.txt): Every page above in one file`,
    `- [Sitemap](${site.url}/sitemap.xml): Every page with the date its content last changed`,
  )
}

export function llmsFullTxt(site: Site): string {
  return [
    lines(
      `# ${host(site)}: full site content`,
      '',
      `Every page of ${site.profile.name}'s website as markdown, in site order. The short index is ${site.url}/llms.txt.`,
    ),
    ...site.pages.map(page => page.markdown),
  ].join('\n\n---\n\n')
}

export function sitemapXml(site: Site): string {
  const urls = site.pages.map(page => [
    '  <url>',
    `    <loc>${escapeXml(`${site.url}${page.path === '/' ? '/' : page.path}`)}</loc>`,
    page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : '',
    '  </url>',
  ].filter(Boolean).join('\n'))
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function aboutPage(site: Site): SitePage {
  const { profile, about } = site
  const featured = site.projects.filter(project => project.overview.featured)
  return {
    path: '/',
    title: 'About',
    summary: 'Intro, current role, selected projects and contact details',
    lastmod: newest(dateOf(profile), dateOf(about), ...featured.map(project => dateOf(project.overview))),
    markdown: lines(
      `# ${profile.name}`,
      '',
      `URL: ${site.url}/`,
      '',
      profileFacts(site, { contact: false }),
      '',
      bodyToMarkdown(about.body, { siteUrl: site.url, pageUrl: `${site.url}/` }),
      '',
      ...(featured.length
        ? [
            '## Selected projects',
            '',
            ...featured.map(({ overview }) => {
              const year = overview.year ? ` (${overview.year})` : ''
              return `- [${overview.title}](${site.url}${overview.path})${year}: ${overview.description ?? ''}`.trimEnd()
            }),
            '',
          ]
        : []),
      '## Contact',
      '',
      contactFacts(site),
    ),
  }
}

function experiencePage(site: Site): SitePage {
  const employment = site.roles.filter(role => !role.consulting)
  const consulting = site.roles.filter(role => role.consulting)
  const since = site.roles.map(role => role.start.slice(0, 4)).sort()[0]

  const roleSection = (role: ExperienceCollectionItem, level: '##' | '###') => lines(
    `${level} ${role.role} at ${role.companyUrl ? `[${role.company}](${role.companyUrl})` : role.company}`,
    '',
    `${formatRange(role.start, role.end)} · ${role.location}`,
    '',
    ...(role.highlights ?? []).map(highlight => `- ${highlight}`),
    '',
    role.stack?.length ? `Stack: ${role.stack.join(', ')}` : '',
  )

  return {
    path: '/experience',
    title: 'Experience',
    summary: `Work history since ${since}, with highlights and the stack for each role`,
    lastmod: newest(...site.roles.map(dateOf)),
    markdown: lines(
      '# Experience',
      '',
      `URL: ${site.url}/experience`,
      '',
      `Work history of ${site.profile.name}, most recent first.`,
      '',
      employment.map(role => roleSection(role, '##')).join('\n\n'),
      ...(consulting.length
        ? ['', '## Consulting', '', consulting.map(role => roleSection(role, '###')).join('\n\n')]
        : []),
    ),
  }
}

function projectsPage(site: Site): SitePage {
  return {
    path: '/projects',
    title: 'Projects',
    summary: 'Every project with a one-line summary, its stack and links',
    lastmod: newest(...site.projects.map(project => dateOf(project.overview))),
    markdown: lines(
      '# Projects',
      '',
      `URL: ${site.url}/projects`,
      '',
      `Selected projects by ${site.profile.name}, with technical write-ups and architecture notes.`,
      '',
      site.projects.map(({ overview, docs }) => lines(
        `## [${overview.title}](${site.url}${overview.path})`,
        '',
        overview.description ?? '',
        '',
        bullets(
          projectFacts(overview),
          docs.length > 1 && `- Write-up: ${docs.map(doc => `[${docLabel(doc, overview.path)}](${site.url}${doc.path})`).join(', ')}`,
        ),
      )).join('\n\n'),
    ),
  }
}

function projectDocPage(site: Site, project: Project, doc: ProjectsCollectionItem): SitePage {
  const { overview, docs } = project
  const isOverview = doc.path === overview.path
  const pageUrl = `${site.url}${doc.path}`
  const index = docs.indexOf(doc)

  return {
    path: doc.path,
    title: isOverview ? overview.title : `${overview.title}: ${doc.title}`,
    summary: isOverview
      ? [doc.description, `${kindLabel(overview)}, ${overview.period ?? overview.year ?? ''}.`.replace(/, \.$/, '.'), overview.stack?.length ? `Stack: ${overview.stack.join(', ')}.` : '']
          .filter(Boolean).join(' ')
      : doc.description ?? '',
    lastmod: dateOf(doc),
    markdown: lines(
      `# ${doc.title}`,
      '',
      `URL: ${pageUrl}`,
      '',
      doc.description ? `> ${doc.description}` : '',
      '',
      isOverview
        ? projectFacts(overview)
        : `Part of the write-up on [${overview.title}](${site.url}${overview.path}), page ${index + 1} of ${docs.length}.`,
      '',
      bodyToMarkdown(doc.body, { siteUrl: site.url, pageUrl }),
      ...(docs.length > 1
        ? [
            '',
            '## Pages in this write-up',
            '',
            ...docs.map((other) => {
              const link = `[${docLabel(other, overview.path)}](${site.url}${other.path})`
              if (other === doc) return `- ${link} (this page)`
              return other.description ? `- ${link}: ${other.description}` : `- ${link}`
            }),
          ]
        : []),
    ),
  }
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function profileFacts(site: Site, { contact = true } = {}): string {
  const { profile } = site
  const company = profile.current.companyUrl ? `[${profile.current.company}](${profile.current.companyUrl})` : profile.current.company
  return bullets(
    `- Current role: ${profile.current.role} at ${company}`,
    `- Location: ${profile.location}`,
    `- Online alias: ${profile.alias}`,
    contact && contactFacts(site),
  )
}

function contactFacts({ profile }: Site): string {
  return bullets(
    `- Email: ${profile.email}`,
    `- GitHub: ${profile.links.github}`,
    `- LinkedIn: ${profile.links.linkedin}`,
    `- Twitch: ${profile.links.twitch}`,
  )
}

function workHistory(site: Site): string[] {
  const employment = site.roles.filter(role => !role.consulting)
  const consulting = site.roles.filter(role => role.consulting)
  return [
    ...employment.map(role => `- ${role.role} at ${role.company}, ${formatRange(role.start, role.end)}`),
    ...consulting.map(role => `- ${role.role} at ${role.company}, ${formatRange(role.start, role.end)} (consulting)`),
  ]
}

function projectFacts(overview: ProjectsCollectionItem): string {
  return bullets(
    `- Type: ${kindLabel(overview)}`,
    overview.period ? `- Period: ${overview.period}` : overview.year ? `- Year: ${overview.year}` : undefined,
    overview.stack?.length ? `- Stack: ${overview.stack.join(', ')}` : undefined,
    overview.links?.live && `- Website: ${overview.links.live}`,
    overview.links?.repo && `- Source code: ${overview.links.repo}`,
  )
}

function kindLabel(overview: ProjectsCollectionItem): string {
  return overview.kind === 'work' ? 'Work project' : 'Personal project'
}

function host(site: Site): string {
  return new URL(site.url).host
}

function dateOf(item: { stem: string, extension: string }): string | undefined {
  return contentDates[`${item.stem}.${item.extension}`]
}

function newest(...dates: (string | undefined)[]): string | undefined {
  return dates.filter((date): date is string => Boolean(date)).sort((a, b) => Date.parse(b) - Date.parse(a))[0]
}

/** List items (or whole lists) on consecutive lines, skipping missing ones so the list stays tight. */
function bullets(...items: (string | false | undefined)[]): string {
  return items.filter(Boolean).join('\n')
}

/** Join lines, collapse runs of blank lines (left by skipped optional parts) into one, and trim the ends. */
function lines(...parts: string[]): string {
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
