<script setup lang="ts">
// One layout for every page so the header, tabs and activity chart never
// remount on navigation. Pages opt into the wide docs column with
// `definePageMeta({ wide: true })`.
const route = useRoute()
</script>

<template>
  <SiteShell :wide="Boolean(route.meta.wide)">
    <slot />
  </SiteShell>
</template>
