<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const props = defineProps<{
  links: TocLink[]
  /** Rendered inside the mobile Contents sheet: clicks are handed to the parent */
  inSheet?: boolean
}>()

const emit = defineEmits<{ navigate: [id: string] }>()
const headingId = useId()

function onClick(event: MouseEvent, id: string) {
  if (!props.inSheet) return
  event.preventDefault()
  emit('navigate', id)
}

/** h2 + h3 only, flattened in document order. */
const items = computed(() => {
  const out: Array<{ id: string, text: string, depth: number }> = []
  for (const link of props.links) {
    out.push({ id: link.id, text: link.text, depth: link.depth })
    for (const child of link.children ?? []) {
      if (child.depth <= 3) out.push({ id: child.id, text: child.text, depth: child.depth })
    }
  }
  return out
})

const activeId = ref<string | null>(null)
let observer: IntersectionObserver | null = null
let endObserver: IntersectionObserver | null = null
let atEnd = false

function setup() {
  observer?.disconnect()
  endObserver?.disconnect()
  const elements = items.value
    .map(item => document.getElementById(item.id))
    .filter((el): el is HTMLElement => Boolean(el))
  if (!elements.length) return

  // Active = the last heading that has crossed the line 30% down the viewport.
  // Once the end of the article is on screen, the last heading that is visible
  // wins, so short final sections can still become active.
  const update = () => {
    const line = window.innerHeight * 0.3
    let current: string | null = elements[0]!.id
    for (const el of elements) {
      const top = el.getBoundingClientRect().top
      if (top <= line || (atEnd && top < window.innerHeight)) current = el.id
      else break
    }
    activeId.value = current
  }

  // Observers only tell us *when* to recompute (no scroll listeners).
  observer = new IntersectionObserver(update, { rootMargin: '0px 0px -70% 0px' })
  elements.forEach(el => observer!.observe(el))

  const end = document.getElementById('docs-end')
  if (end) {
    endObserver = new IntersectionObserver((entries) => {
      atEnd = entries.some(entry => entry.isIntersecting)
      update()
    })
    endObserver.observe(end)
  }
  update()
}

onMounted(() => nextTick(setup))
watch(items, () => nextTick(setup))
onBeforeUnmount(() => {
  observer?.disconnect()
  endObserver?.disconnect()
})
</script>

<template>
  <nav v-if="items.length" :aria-labelledby="headingId" class="text-sm" data-toc>
    <p :id="headingId" class="font-mono text-xs text-muted-foreground">
      On this page
    </p>
    <ul class="mt-3 space-y-1.5">
      <li v-for="item in items" :key="item.id" :class="item.depth === 3 ? 'pl-3' : ''">
        <a
          :href="`#${item.id}`"
          class="block leading-snug transition-colors duration-150"
          :class="activeId === item.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
          :aria-current="activeId === item.id ? 'location' : undefined"
          @click="onClick($event, item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
