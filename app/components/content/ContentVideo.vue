<script setup lang="ts">
withDefaults(defineProps<{
  src: string
  poster?: string
  caption?: string
}>(), { poster: undefined, caption: undefined })
</script>

<template>
  <figure class="not-prose my-6">
    <video
      :src="src"
      :poster="poster"
      controls
      playsinline
      preload="metadata"
      class="block h-auto w-full rounded-lg border bg-subtle"
    >
      <a :href="src">Download the video</a>
    </video>
    <figcaption v-if="caption" class="mt-2 text-center text-[13px] leading-snug text-muted-foreground">
      {{ caption }}
    </figcaption>
  </figure>
</template>
