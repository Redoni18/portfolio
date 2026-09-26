<script setup lang="ts">
import type { VNode } from 'vue'
import { Fragment } from 'vue'

provide(codeGroupKey, true)

const slots = useSlots()

/** Flatten fragments and keep only code-block vnodes (they carry a `code` prop). */
function collect(nodes: VNode[] | undefined): VNode[] {
  const out: VNode[] = []
  for (const node of nodes ?? []) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      out.push(...collect(node.children as VNode[]))
    }
    else if (node.props && ('code' in node.props || 'language' in node.props)) {
      out.push(node)
    }
  }
  return out
}

function blocks() {
  return collect(slots.default?.())
}

function labelOf(node: VNode, index: number): string {
  const props = node.props ?? {}
  return String(props.filename || props.language || `Code ${index + 1}`)
}
</script>

<template>
  <Tabs default-value="0" class="not-prose my-6 flex-col gap-0 overflow-hidden rounded-lg border bg-subtle">
    <TabsList
      variant="line"
      class="h-9 w-full justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0 px-1 shadow-[inset_0_-1px_0_var(--border)]"
    >
      <TabsTrigger
        v-for="(node, index) in blocks()"
        :key="index"
        :value="String(index)"
        class="h-full flex-none rounded-none border-0 px-3 font-mono text-xs font-normal text-muted-foreground shadow-none! after:bottom-0! after:h-px! data-active:bg-transparent! data-active:text-foreground dark:data-active:bg-transparent! dark:data-active:border-transparent"
      >
        {{ labelOf(node, index) }}
      </TabsTrigger>
    </TabsList>
    <!-- force-mount keeps every block in the prerendered HTML -->
    <TabsContent
      v-for="(node, index) in blocks()"
      :key="index"
      :value="String(index)"
      force-mount
      class="data-[state=inactive]:hidden"
    >
      <component :is="node" />
    </TabsContent>
  </Tabs>
</template>
