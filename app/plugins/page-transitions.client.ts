/**
 * Scroll handling for the page transitions (middleware/view-transition.global.ts,
 * "Page transitions" in main.css).
 *
 * Nuxt scrolls a new page into place (to the top, or back to where you were on
 * back/forward) a frame after it has rendered. A page transition captures the
 * new page before that frame, so its incoming snapshot would still be at the old
 * scroll position and the page would jump once the transition ends. So while a
 * page transition is running, scroll as soon as the new page has rendered, while
 * it's still hidden behind the transition. Nuxt's own scroll a frame later then
 * finds the page already in place.
 *
 * It also keeps the cursor steady while a page transition runs
 * (utils/view-transition-cursor.ts).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let transition: ViewTransition | undefined

  router.beforeEach(() => {
    transition = undefined
  })

  nuxtApp.hook('page:view-transition:start', (started) => {
    transition = started
    const scrollBefore = window.scrollY
    started.ready
      .then(() => {
        if (SLIDE_TYPES.some(type => started.types.has(type))) {
          cancelScrollMotion(window.scrollY - scrollBefore)
        }
      })
      // Skipped transitions reject `ready`; there's nothing to adjust then
      .catch(() => {})
  })

  // The clicked link keeps the hand instead of flipping to an arrow until the transition ends
  nuxtApp.hook('page:view-transition:start', holdCursorDuringViewTransition)

  nuxtApp.hook('page:finish', () => {
    if (!transition) return
    transition = undefined

    const route = router.currentRoute.value
    // Hash targets and pages that opt out of scrolling keep Nuxt's own handling
    if (route.hash || route.meta.scrollToTop === false) return

    // vue-router keeps the position to restore on back/forward in history.state
    // (null for a new entry, which starts at the top)
    const saved = history.state?.scroll as { left: number, top: number } | null | undefined
    window.scrollTo({ left: saved?.left ?? 0, top: saved?.top ?? 0, behavior: 'instant' })
  })
})

const SLIDE_TYPES = ['slide-forward', 'slide-back', 'chapter-forward', 'chapter-back']

/** The named parts of a slide that sit in the normal flow (the sticky TOC doesn't move at all). */
const SLIDE_GROUPS = [
  '::view-transition-group(page-main)',
  '::view-transition-group(page-article)',
  '::view-transition-group(docs-contents)',
  '::view-transition-group(page-bottom)',
]

/**
 * The browser moves each named part from where it was on screen to where it is
 * now. Between the two snapshots the page scrolled (a tab or "Next" clicked from
 * lower down, the footer link, back/forward), so a slide would also glide <main>
 * (or the article) up or down by that distance, right across the header. Take
 * the scroll out of that motion: they then only slide sideways, and the chart and
 * footer only move by the change in height. This edits the start of the
 * browser's own group animation, so the timing stays exactly its own.
 */
function cancelScrollMotion(scrolledBy: number) {
  if (!scrolledBy) return
  for (const animation of document.getAnimations()) {
    const effect = animation.effect as KeyframeEffect | null
    if (!effect?.pseudoElement || !SLIDE_GROUPS.includes(effect.pseudoElement)) continue

    const [from, ...rest] = effect.getKeyframes()
    if (typeof from?.transform !== 'string') continue
    // Start where it would have been had the page already been at its new scroll
    effect.setKeyframes([{ ...from, transform: `translateY(${-scrolledBy}px) ${from.transform}` }, ...rest])
  }
}
