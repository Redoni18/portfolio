<script setup lang="ts">
/** Optional fixed column count (2–4); by default columns auto-fit. */
const props = defineProps<{ cols?: string | number }>()

const style = computed(() => {
  const n = Number(props.cols)
  if (Number.isFinite(n) && n >= 1) {
    return { '--stat-cols': String(Math.min(4, Math.max(2, n))) }
  }
  return undefined
})
</script>

<template>
  <div
    class="not-prose my-6 grid grid-cols-2 gap-3"
    :class="style ? 'sm:grid-cols-[repeat(var(--stat-cols),minmax(0,1fr))]' : 'sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]'"
    :style="style"
  >
    <slot mdc-unwrap="p" />
  </div>
</template>
