/**
 * The main nav tabs, left to right. SiteNav renders them, and tab-to-tab page
 * transitions slide in the direction of this order
 * (app/middleware/view-transition.global.ts).
 */
export const siteTabs = [
  { label: 'About', to: '/', match: (path: string) => path === '/' },
  { label: 'Experience', to: '/experience', match: (path: string) => path === '/experience' || path.startsWith('/experience/') },
  { label: 'Projects', to: '/projects', match: (path: string) => path === '/projects' || path.startsWith('/projects/') },
]

/** Position of the tab a path belongs to, or -1 when it's under none of them. */
export function siteTabIndex(path: string): number {
  return siteTabs.findIndex(tab => tab.match(path))
}
