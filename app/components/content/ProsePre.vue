<script setup lang="ts">
const props = withDefaults(defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>(), {
  code: '',
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
  class: null,
})

const inGroup = inject(codeGroupKey, false)
const isMermaid = computed(() => props.language === 'mermaid')
const label = computed(() => props.filename || props.language || 'text')
</script>

<template>
  <!-- ```mermaid fences anywhere render as diagrams -->
  <Mermaid v-if="isMermaid" :code="code" />

  <!-- Inside ::code-group the group draws the frame and the tabs -->
  <div v-else-if="inGroup" class="not-prose relative">
    <div class="absolute top-1.5 right-1.5 z-10">
      <CopyCodeButton :code="code" />
    </div>
    <pre :class="props.class" class="code-pre"><slot /></pre>
  </div>

  <div v-else class="not-prose my-6 overflow-hidden rounded-lg border bg-subtle">
    <div class="flex h-9 items-center justify-between gap-4 border-b pr-1.5 pl-4">
      <span class="truncate font-mono text-xs text-muted-foreground">{{ label }}</span>
      <CopyCodeButton :code="code" />
    </div>
    <pre :class="props.class" class="code-pre"><slot /></pre>
  </div>
</template>
