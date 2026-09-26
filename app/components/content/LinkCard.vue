<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from '@lucide/vue'

const props = defineProps<{
  title: string
  description?: string
  to: string
}>()

const external = computed(() => isExternalUrl(props.to))
</script>

<template>
  <NuxtLink
    :to="to"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    class="not-prose group my-4 flex items-start justify-between gap-4 rounded-lg border px-4 py-3 transition-colors duration-150 hover:bg-muted/50"
  >
    <span class="min-w-0">
      <span class="block font-medium text-foreground">{{ title }}</span>
      <span v-if="description" class="mt-0.5 block text-sm text-muted-foreground">{{ description }}</span>
    </span>
    <ArrowUpRight
      v-if="external"
      class="mt-1 size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
      aria-hidden="true"
    />
    <ArrowRight
      v-else
      class="mt-1 size-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
      aria-hidden="true"
    />
    <span v-if="external" class="sr-only">(opens in a new tab)</span>
  </NuxtLink>
</template>
