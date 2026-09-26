<script setup lang="ts">
import type { ContributionDay, ContributionsResponse, ContributionWeek } from '#shared/types/github'

const WEEKS = 53
const GAP = 2
/** Width of the weekday label column (w-6 + mr-1.5), plus 1px so rounding never overflows */
const LABEL_COLUMN = 31
/** A month label needs this many week columns before the next label */
const MIN_LABEL_COLUMNS = 3
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const LEVEL_CLASSES = [
  'bg-(--gh-0)',
  'bg-(--gh-1)',
  'bg-(--gh-2)',
  'bg-(--gh-3)',
  'bg-(--gh-4)',
] as const

const config = useRuntimeConfig()
const username = computed(() => String(config.public.githubUsername || 'Redoni18'))
const profileUrl = computed(() => `https://github.com/${username.value}`)

// Client-only on purpose: prerendered pages must never bake in stale numbers.
const { data, error } = useFetch('/api/github/contributions', {
  key: 'github-contributions',
  server: false,
  lazy: true,
  // The route returns a pre-serialised JSON string (edge-cache friendly), so the
  // inferred type is loose; non-2xx responses surface as `error` instead.
  transform: response => response as unknown as ContributionsResponse,
  // Reuse data already fetched in this session (e.g. when the error page mounts its own shell).
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
})

const placeholderWeeks: ContributionWeek[] = Array.from({ length: WEEKS }, () =>
  Array.from({ length: 7 }, () => ({ date: '', count: 0, level: 0 as const })))

const loaded = computed(() => Boolean(data.value?.weeks?.length))
const weeks = computed<ContributionWeek[]>(() => loaded.value ? data.value!.weeks : placeholderWeeks)

/**
 * Cells grow so the year spans the full column, never smaller than 10px (below
 * that the weeks scroll, newest first). `cqw` is the width of the `@container` root.
 */
const cellSize = computed(() => {
  const n = weeks.value.length
  return `max(10px, calc((100cqw - ${LABEL_COLUMN}px - ${(n - 1) * GAP}px) / ${n}))`
})

function parseDate(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!))
}

/** `Mon, Sep 21, 2025` — formatted manually so it's locale/timezone stable. */
function formatDay(date: string) {
  const d = parseDate(date)
  return `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function describe(day: ContributionDay) {
  const what = day.count === 0 ? 'No contributions' : `${day.count} contribution${day.count === 1 ? '' : 's'}`
  return `${what} on ${formatDay(day.date)}`
}

/** Month label at the first week column whose first day falls in a new month. */
const monthLabels = computed(() => {
  if (!loaded.value) return []
  const labels: Array<{ index: number, label: string }> = []
  let previous = -1
  weeks.value.forEach((week, index) => {
    const first = week.find(Boolean)
    if (!first) return
    const month = parseDate(first.date).getUTCMonth()
    if (month !== previous) {
      labels.push({ index, label: MONTHS[month]! })
      previous = month
    }
  })
  // Like GitHub: skip a label when there are fewer than 3 week columns before
  // the next one (e.g. a partial first month), or when it would overflow the end.
  return labels.filter((label, i) => {
    const next = labels[i + 1]
    if (next && next.index - label.index < MIN_LABEL_COLUMNS) return false
    return label.index <= weeks.value.length - 2
  })
})

const totalLabel = computed(() => {
  const total = data.value?.total ?? 0
  return `${total.toLocaleString('en-US')} contribution${total === 1 ? '' : 's'}`
})

/* ---------- One shared tooltip, driven by event delegation ---------- */
const root = ref<HTMLElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const tooltipEl = ref<HTMLElement | null>(null)
const tooltip = reactive({ visible: false, text: '', x: 0, y: 0 })

function showTooltip(event: Event) {
  const target = event.target as HTMLElement | null
  const cell = target?.closest<HTMLElement>('[data-date]')
  if (!cell || !cell.dataset.date || !root.value) {
    tooltip.visible = false
    return
  }
  const cellRect = cell.getBoundingClientRect()
  const rootRect = root.value.getBoundingClientRect()
  tooltip.text = cell.getAttribute('aria-label') ?? ''
  tooltip.x = cellRect.left - rootRect.left + cellRect.width / 2
  tooltip.y = cellRect.top - rootRect.top
  tooltip.visible = true

  // Keep the tooltip inside the column (matters for the newest weeks on mobile).
  nextTick(() => {
    if (!tooltipEl.value || !root.value) return
    const half = tooltipEl.value.offsetWidth / 2
    const max = Math.max(half, root.value.clientWidth - half)
    tooltip.x = Math.min(Math.max(tooltip.x, half), max)
  })
}

function hideTooltip() {
  tooltip.visible = false
}

// Show the most recent weeks first on narrow screens.
watch(loaded, async (isLoaded) => {
  if (!isLoaded) return
  await nextTick()
  if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth
}, { immediate: true })

onMounted(() => {
  if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth
})
</script>

<template>
  <section aria-labelledby="github-activity-heading" class="text-sm">
    <!-- Failure: one quiet line (no retry spinner, no layout theatrics) -->
    <p v-if="error && !loaded" class="text-muted-foreground">
      GitHub activity unavailable —
      <a :href="profileUrl" class="link" target="_blank" rel="noopener">view profile on GitHub</a>.
    </p>

    <div v-else ref="root" class="@container relative" :style="{ '--cell': cellSize }">
      <h2 id="github-activity-heading" class="h-5 text-sm leading-5 font-normal">
        <a v-if="loaded" :href="profileUrl" class="link tabular-nums" target="_blank" rel="noopener">
          {{ totalLabel }} in the last year
        </a>
        <span v-else class="text-muted-foreground">GitHub activity</span>
      </h2>

      <div class="mt-3 flex">
        <!-- Weekday labels stay put while the weeks scroll on narrow screens -->
        <div
          class="mr-1.5 flex w-6 shrink-0 flex-col font-mono text-[10px] leading-[10px] text-muted-foreground"
          :style="{ gap: `${GAP}px`, paddingTop: '18px' }"
          aria-hidden="true"
        >
          <span v-for="(label, i) in WEEKDAY_LABELS" :key="i" class="h-(--cell) leading-(--cell)">{{ label }}</span>
        </div>

        <div
          ref="scroller"
          class="min-w-0 flex-1 overflow-x-auto overflow-y-hidden pb-1"
          @scroll.passive="hideTooltip"
        >
          <div class="w-max" :aria-busy="!loaded">
            <!-- Month labels -->
            <div class="relative h-[15px] font-mono text-[10px] leading-[10px] text-muted-foreground" aria-hidden="true">
              <span
                v-for="month in monthLabels"
                :key="`${month.index}-${month.label}`"
                class="absolute top-0"
                :style="{ left: `calc(${month.index} * (var(--cell) + ${GAP}px))` }"
              >{{ month.label }}</span>
            </div>

            <!-- Calendar -->
            <div
              class="mt-[3px] flex"
              :style="{ gap: `${GAP}px` }"
              role="group"
              :aria-label="loaded ? `GitHub contributions calendar: ${totalLabel} in the last year` : 'Loading GitHub contributions'"
              @mouseover="showTooltip"
              @mouseleave="hideTooltip"
            >
              <div
                v-for="(week, w) in weeks"
                :key="w"
                class="flex flex-col"
                :style="{ gap: `${GAP}px` }"
              >
                <template v-for="(day, d) in week" :key="d">
                  <span
                    v-if="day && day.date"
                    role="img"
                    class="block size-(--cell) rounded-[2px] shadow-[inset_0_0_0_1px_var(--gh-0-border)]"
                    :class="LEVEL_CLASSES[day.level]"
                    :data-date="day.date"
                    :data-level="day.level"
                    :aria-label="describe(day)"
                  />
                  <span
                    v-else-if="day"
                    class="block size-(--cell) rounded-[2px] bg-(--gh-0) shadow-[inset_0_0_0_1px_var(--gh-0-border)]"
                    aria-hidden="true"
                  />
                  <span v-else class="block size-(--cell)" aria-hidden="true" />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-2 flex items-center justify-end gap-1 font-mono text-[11px] leading-4 text-muted-foreground" aria-hidden="true">
        <span class="mr-1">Less</span>
        <span
          v-for="(cls, level) in LEVEL_CLASSES"
          :key="level"
          class="block size-(--cell) rounded-[2px] shadow-[inset_0_0_0_1px_var(--gh-0-border)]"
          :class="cls"
        />
        <span class="ml-1">More</span>
      </div>

      <!-- Shared tooltip -->
      <div
        v-show="tooltip.visible"
        ref="tooltipEl"
        role="presentation"
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y - 6}px` }"
      >
        {{ tooltip.text }}
      </div>
    </div>
  </section>
</template>
