<script setup lang="ts">
import { CircleAlert, Info, Lightbulb, TriangleAlert } from '@lucide/vue'

type CalloutType = 'note' | 'tip' | 'warning' | 'important'

const props = withDefaults(defineProps<{
  type?: CalloutType
  title?: string
}>(), { type: 'note', title: undefined })

const VARIANTS = {
  note: { icon: Info, label: 'Note', border: 'border-foreground/20' },
  tip: { icon: Lightbulb, label: 'Tip', border: 'border-foreground/20' },
  warning: { icon: TriangleAlert, label: 'Warning', border: 'border-foreground/70' },
  important: { icon: CircleAlert, label: 'Important', border: 'border-foreground' },
} as const

const variant = computed(() => VARIANTS[props.type as CalloutType] ?? VARIANTS.note)
</script>

<template>
  <div
    role="note"
    class="callout my-6 rounded-r-md border-l-2 bg-subtle px-4 py-3"
    :class="variant.border"
    :data-type="type"
  >
    <p class="not-prose flex items-center gap-2 text-sm font-medium text-foreground">
      <component :is="variant.icon" class="size-4 shrink-0" aria-hidden="true" />
      {{ title || variant.label }}
    </p>
    <div class="callout-body mt-1.5 text-[0.95em] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      <slot />
    </div>
  </div>
</template>
