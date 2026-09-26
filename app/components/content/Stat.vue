<script setup lang="ts">
defineProps<{
  value: string | number
  label: string
}>()
</script>

<template>
  <div class="rounded-lg border px-4 py-3">
    <div class="text-xl font-semibold tracking-tight text-foreground tabular-nums">
      {{ value }}
    </div>
    <div class="mt-0.5 font-mono text-xs leading-snug text-muted-foreground">
      {{ label }}
    </div>
  </div>
</template>
