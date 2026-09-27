let holding: ViewTransition | undefined

/**
 * Keeps the cursor steady through a view transition: the page transitions
 * (plugins/page-transitions.client.ts) and the theme switch (ThemeToggle.vue).
 *
 * While a view transition runs, the browser hit-tests the root element instead
 * of whatever is under the pointer: first while it captures the old page and
 * the DOM updates, then because the transition's `::view-transition` overlay
 * covers the page. So the cursor becomes <html>'s own, the arrow. A link or
 * button you just clicked turns from the hand to an arrow a moment after the
 * click, for the length of the transition.
 *
 * Give <html> the cursor the pointer had when the transition started (the hand,
 * on a link or button) until the transition has finished. Clicks during a
 * transition land on <html> anyway, so nothing else changes.
 */
export function holdCursorDuringViewTransition(transition: ViewTransition) {
  // `:hover` matches the element under the pointer and its ancestors, in document order
  const hovered = [...document.querySelectorAll(':hover')].at(-1)
  if (!hovered) return

  const root = document.documentElement
  root.style.cursor = getComputedStyle(hovered).cursor
  holding = transition
  transition.finished
    .catch(() => {})
    .finally(() => {
      // A newer transition replaced this one and holds its own cursor
      if (holding !== transition) return
      holding = undefined
      root.style.removeProperty('cursor')
    })
}
