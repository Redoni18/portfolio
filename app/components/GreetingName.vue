<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

/**
 * The first name in the header greeting, with the online alias in a small tooltip.
 * Opens on mouse hover, keyboard focus or a tap; closes on leave, blur, Escape or
 * a tap elsewhere. Sits above the name, or below it on phones where the header is
 * too close to the top of the screen.
 *
 * `focusable` is off when the name sits inside the header's home link, since a
 * tab stop nested in a link is invalid. Hover still works there. Only the
 * focusable name opens on a tap, so only it sets the hand itself; inside the
 * link it gets the link's.
 */
const props = defineProps<{ name: string, alias: string, focusable?: boolean }>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const tooltipId = useId()

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse') open.value = true
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse') open.value = false
}

// Taps: iOS doesn't always focus a tabindex span, so a click opens it too
function onClick() {
  if (props.focusable) open.value = true
}

onClickOutside(root, () => {
  open.value = false
})
</script>

<template>
  <span
    ref="root"
    class="relative underline decoration-dotted decoration-[1.5px] underline-offset-[5px] decoration-muted-foreground/50 transition-[text-decoration-color] duration-150 hover:decoration-foreground"
    :class="{ 'decoration-foreground': open, 'cursor-pointer': focusable }"
    :tabindex="focusable ? 0 : undefined"
    :aria-describedby="tooltipId"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focus="open = true"
    @blur="open = false"
    @click="onClick"
    @keydown.esc="open = false"
  >{{ name }}<span
    :id="tooltipId"
    role="tooltip"
    class="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-md sm:top-auto sm:bottom-full sm:mt-0 sm:mb-2 bg-foreground px-2 py-1 text-xs leading-4 font-normal tracking-normal whitespace-nowrap text-background transition-[opacity,visibility] duration-150"
    :class="open ? 'visible opacity-100' : 'invisible opacity-0'"
  >Online, I go by <span class="font-mono">{{ alias }}</span></span></span>
</template>
