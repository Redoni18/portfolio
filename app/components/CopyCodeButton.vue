<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'

const props = defineProps<{ code: string }>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
  }
  catch {
    // Fallback for non-secure contexts
    const area = document.createElement('textarea')
    area.value = props.code
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Button
    variant="ghost"
    size="icon-xs"
    class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
    :aria-label="copied ? 'Copied' : 'Copy code'"
    :title="copied ? 'Copied' : 'Copy code'"
    @click="copy"
  >
    <Check v-if="copied" class="size-3.5" aria-hidden="true" />
    <Copy v-else class="size-3.5" aria-hidden="true" />
  </Button>
  <span class="sr-only" aria-live="polite">{{ copied ? 'Copied to clipboard' : '' }}</span>
</template>
