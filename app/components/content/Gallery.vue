<script setup lang="ts">
/**
 * Optional fixed column count (2–4) for a single row of figures: one row on
 * desktop, a horizontally scrolling strip on phones. By default figures wrap in
 * two columns.
 */
const props = defineProps<{ cols?: string | number }>()

const style = computed(() => {
  const n = Number(props.cols)
  if (Number.isFinite(n) && n >= 1) {
    return { '--gallery-cols': String(Math.min(4, Math.max(2, n))) }
  }
  return undefined
})
</script>

<template>
  <!-- `mdc-unwrap="p"` lifts inline `:figure{}` children out of their paragraph -->
  <div
    v-if="style"
    class="not-prose my-6 -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(var(--gallery-cols),minmax(0,1fr))] sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [&>figure]:my-0 [&>figure]:w-[42%] [&>figure]:shrink-0 [&>figure]:snap-start sm:[&>figure]:w-auto"
    :style="style"
  >
    <slot mdc-unwrap="p" />
  </div>
  <div v-else class="not-prose my-6 grid gap-4 sm:grid-cols-2 [&>figure]:my-0">
    <slot mdc-unwrap="p" />
  </div>
</template>
