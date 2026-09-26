<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

/**
 * Switches the theme with a circular reveal: the new colours grow out of the
 * viewport's top-right corner and sweep across the page, reaching the
 * bottom-left corner exactly as the animation ends.
 *
 * The radius grows linearly. A circle growing from a corner already covers the
 * screen slowly at first and last, so any extra easing leaves a long tail where
 * only the last corner is still changing, which reads as a pause and a snap.
 *
 * Uses the View Transitions API; browsers without it, and anyone who prefers
 * reduced motion, get the plain instant switch.
 */
async function toggle() {
  const next = colorMode.value === 'dark' ? 'light' : 'dark'
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    colorMode.preference = next
    return
  }

  const transition = document.startViewTransition(async () => {
    colorMode.preference = next
    // color-mode applies the `dark` class from a watcher; let it run before the new snapshot
    await nextTick()
  })
  await transition.ready

  // Percentages are of the snapshot box, so this tracks the real viewport
  // (mobile toolbars included). A circle() radius of 100% is diagonal / √2,
  // so 141.5% is just past the full diagonal: top-right to bottom-left.
  document.documentElement.animate(
    { clipPath: ['circle(0% at 100% 0%)', 'circle(141.5% at 100% 0%)'] },
    { duration: 500, easing: 'linear', pseudoElement: '::view-transition-new(root)' },
  )
}
</script>

<template>
  <!--
    Both icons are always rendered and swapped with the `dark` class, so the
    prerendered (light) markup never mismatches a stored dark preference.
  -->
  <Button
    variant="ghost"
    size="icon"
    class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
    aria-label="Toggle dark mode"
    title="Toggle dark mode"
    @click="toggle"
  >
    <Moon class="size-5 dark:hidden" aria-hidden="true" />
    <Sun class="hidden size-5 dark:block" aria-hidden="true" />
  </Button>
</template>
