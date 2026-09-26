<script setup lang="ts">
const config = useRuntimeConfig()
const domain = new URL(config.public.siteUrl).host
</script>

<template>
  <footer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t py-6 font-mono text-xs">
    <NuxtLink to="/" class="link-muted">
      {{ domain }}
    </NuxtLink>
    <SocialLinks size="icon-sm" icon-class="size-4" class="-mr-2" />
  </footer>
</template>
