<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

/**
 * A tech stack as a single row of badges. Whatever doesn't fit collapses into a
 * "+N" button that lists the rest in a popover.
 *
 * Until the row has been measured (prerendered HTML, first paint) every badge is
 * rendered and the row clips instead of wrapping, so the layout never jumps to a
 * second line.
 */
const props = defineProps<{ items: string[] }>()

const root = ref<HTMLElement | null>(null)
const ruler = ref<HTMLElement | null>(null)
const visibleCount = ref(props.items.length)

const visible = computed(() => props.items.slice(0, visibleCount.value))
const hidden = computed(() => props.items.slice(visibleCount.value))

/** How many badges fit, leaving room for the "+N" button whenever some don't. */
function fit() {
  if (!root.value || !ruler.value) return
  const available = root.value.clientWidth
  const gap = Number.parseFloat(getComputedStyle(root.value).columnGap) || 0
  const widths = [...ruler.value.querySelectorAll<HTMLElement>('[data-item]')].map(el => el.offsetWidth)
  const moreWidth = ruler.value.querySelector<HTMLElement>('[data-more]')?.offsetWidth ?? 0

  const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(widths.length - 1, 0)
  if (total <= available) {
    visibleCount.value = widths.length
    return
  }

  let used = 0
  let count = 0
  for (const width of widths) {
    const next = used + (count ? gap : 0) + width
    if (next + gap + moreWidth > available) break
    used = next
    count++
  }
  visibleCount.value = count
}

onMounted(() => {
  fit()
  // Badge widths change once the web font has loaded
  document.fonts?.ready.then(fit)
})
useResizeObserver(root, fit)
watch(() => props.items, fit)

const badgeClass = 'font-mono text-xs font-normal text-muted-foreground'
</script>

<template>
  <div ref="root" class="relative flex min-w-0 items-center gap-1.5">
    <ul class="flex min-w-0 gap-1.5 overflow-hidden" aria-label="Stack">
      <li v-for="tech in visible" :key="tech" class="flex">
        <Badge variant="outline" :class="badgeClass">
          {{ tech }}
        </Badge>
      </li>
    </ul>

    <Popover v-if="hidden.length">
      <PopoverTrigger as-child>
        <button
          type="button"
          class="pointer-events-auto inline-flex h-5 shrink-0 items-center rounded-4xl border px-2 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground"
          :aria-label="`Show ${hidden.length} more: ${hidden.join(', ')}`"
        >
          +{{ hidden.length }}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-auto max-w-72 p-2">
        <ul class="flex flex-wrap gap-1.5" aria-label="More of the stack">
          <li v-for="tech in hidden" :key="tech" class="flex">
            <Badge variant="outline" :class="badgeClass">
              {{ tech }}
            </Badge>
          </li>
        </ul>
      </PopoverContent>
    </Popover>

    <!-- Off-screen copy of every badge, used only to measure widths -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden" aria-hidden="true">
      <div ref="ruler" class="invisible flex w-max gap-1.5">
        <Badge v-for="tech in items" :key="tech" data-item variant="outline" :class="badgeClass">
          {{ tech }}
        </Badge>
        <span data-more class="inline-flex h-5 items-center rounded-4xl border px-2 font-mono text-xs">+{{ items.length }}</span>
      </div>
    </div>
  </div>
</template>
