<script setup lang="ts">
/** A section of the About page: a hairline, a small mono label, then its content below it. */
defineProps<{ label: string, id?: string }>()
</script>

<template>
  <section class="border-t pt-6" :aria-labelledby="id">
    <div class="flex items-baseline justify-between gap-4">
      <h2 :id="id" class="font-mono text-sm leading-6 font-normal text-muted-foreground">
        {{ label }}
      </h2>
      <div v-if="$slots.action" class="shrink-0 font-mono text-sm leading-6">
        <slot name="action" />
      </div>
    </div>
    <div class="mt-3 min-w-0">
      <slot />
    </div>
  </section>
</template>
