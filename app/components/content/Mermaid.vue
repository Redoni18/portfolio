<script lang="ts">
// mermaid.initialize() sets one global config for every later render, so the
// initialize + render pairs of all diagrams on a page run one at a time.
let queue: Promise<unknown> = Promise.resolve()
function serially<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job)
  queue = run.catch(() => {})
  return run
}
</script>

<script setup lang="ts">
import type { VNode } from 'vue'

/**
 * Mermaid diagram. Source comes from the `code` prop (used by ProsePre for bare
 * ```mermaid fences) or from the default slot (a ```mermaid fence or plain text).
 * The source is server-rendered as a code block; the diagram is rendered on the
 * client with a lazily imported `mermaid` so other pages never load it.
 *
 * Both themes are rendered once, up front, and swapped with the `dark` class.
 * Re-rendering on a theme switch would land halfway through the theme toggle's
 * reveal, and the diagram would snap from the old colours to the new ones.
 */
const props = defineProps<{ code?: string }>()
const slots = useSlots()

function textOf(nodes: unknown): string {
  if (nodes == null || typeof nodes === 'boolean') return ''
  if (typeof nodes === 'string' || typeof nodes === 'number') return String(nodes)
  if (Array.isArray(nodes)) {
    return nodes.map(textOf).filter(Boolean).join('\n')
  }
  const node = nodes as VNode
  if (node.props && typeof node.props.code === 'string') return node.props.code
  const children = node.children as unknown
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(textOf).join('')
  if (children && typeof children === 'object' && 'default' in children && typeof (children as { default: unknown }).default === 'function') {
    return textOf((children as { default: () => unknown }).default())
  }
  return ''
}

// Slots must be read during render (Vue warns otherwise), so the template calls
// getSource() and the result is cached for the client-side render below.
let cachedSource: string | null = null
function getSource(): string {
  if (typeof props.code === 'string') return props.code.trim()
  if (cachedSource === null) cachedSource = textOf(slots.default?.()).trim()
  return cachedSource
}

const baseId = `mermaid-${useId().replace(/[^\w-]/g, '')}`
const svg = ref<{ light: string, dark: string } | null>(null)
const failed = ref(false)

async function renderMode(source: string, mode: 'light' | 'dark') {
  const id = `${baseId}-${mode}`
  const { default: mermaid } = await import('mermaid')
  try {
    return await serially(async () => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        themeVariables: mermaidThemeVariables(mode),
        fontFamily: MERMAID_FONT,
      })
      return (await mermaid.render(id, source)).svg
    })
  }
  catch (error) {
    // mermaid leaves its temporary error container in <body> on failure
    document.getElementById(`d${id}`)?.remove()
    throw error
  }
}

async function render() {
  // Guard keeps `mermaid` out of the server/worker bundle entirely.
  if (!import.meta.client) return
  const source = getSource()
  if (!source) return
  try {
    const light = await renderMode(source, 'light')
    const dark = await renderMode(source, 'dark')
    svg.value = { light, dark }
  }
  catch (error) {
    failed.value = true
    console.warn('[mermaid] could not render diagram:', error)
  }
}

onMounted(render)
</script>

<template>
  <figure class="not-prose my-6">
    <div
      v-if="svg"
      class="mermaid-diagram overflow-x-auto rounded-lg border px-4 py-6 [&_svg]:h-auto [&_svg]:max-w-full"
      role="img"
      :aria-label="`Diagram: ${getSource().split('\n')[0]}`"
    >
      <div class="flex justify-center dark:hidden" v-html="svg.light" />
      <div class="hidden justify-center dark:flex" v-html="svg.dark" />
    </div>
    <div v-else class="overflow-hidden rounded-lg border bg-subtle">
      <div class="flex h-9 items-center border-b px-4 font-mono text-xs text-muted-foreground">
        {{ failed ? 'mermaid (could not render)' : 'mermaid' }}
      </div>
      <pre class="code-pre"><code>{{ getSource() }}</code></pre>
    </div>
  </figure>
</template>
