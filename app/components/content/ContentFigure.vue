<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt?: string
  caption?: string
  /** Optional variant shown instead of `src` in dark mode */
  srcDark?: string
  width?: string | number
  height?: string | number
}>(), { alt: '', caption: undefined, srcDark: undefined, width: undefined, height: undefined })

const open = ref(false)
const label = computed(() => props.alt || props.caption || 'Image')
</script>

<template>
  <figure class="not-prose my-6">
    <button
      type="button"
      class="block w-full cursor-pointer overflow-hidden rounded-lg border bg-subtle"
      :aria-label="`Enlarge image: ${label}`"
      @click="open = true"
    >
      <img
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
        class="block h-auto w-full"
        :class="srcDark ? 'dark:hidden' : ''"
      >
      <img
        v-if="srcDark"
        :src="srcDark"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
        class="hidden h-auto w-full dark:block"
      >
    </button>
    <figcaption v-if="caption" class="mt-2 text-center text-[13px] leading-snug text-muted-foreground">
      {{ caption }}
    </figcaption>

    <Dialog v-model:open="open">
      <DialogContent class="max-h-[92vh] w-auto max-w-[96vw] gap-3 p-3 sm:max-w-[min(96vw,80rem)]">
        <DialogTitle class="sr-only">
          {{ label }}
        </DialogTitle>
        <DialogDescription v-if="caption" class="sr-only">
          {{ caption }}
        </DialogDescription>
        <img
          :src="src"
          :alt="alt"
          class="mx-auto block max-h-[80vh] w-auto max-w-full rounded-md"
          :class="srcDark ? 'dark:hidden' : ''"
        >
        <img
          v-if="srcDark"
          :src="srcDark"
          :alt="alt"
          class="mx-auto hidden max-h-[80vh] w-auto max-w-full rounded-md dark:block"
        >
        <p v-if="caption" class="pr-8 text-center text-[13px] text-muted-foreground">
          {{ caption }}
        </p>
      </DialogContent>
    </Dialog>
  </figure>
</template>
