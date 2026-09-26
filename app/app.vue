<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const colorMode = useColorMode()

const canonical = computed(() => {
  const path = route.path === '/' ? '/' : route.path.replace(/\/+$/, '')
  return `${config.public.siteUrl}${path}`
})

useHead({
  // `%s · Redon Emini`, or just the name when a page sets no title (e.g. the 404 shell)
  titleTemplate: title => title ? `${title} · Redon Emini` : 'Redon Emini',
  link: [{ rel: 'canonical', href: canonical }],
  // Browser UI colour follows the site theme (not the OS), matching --background
  meta: [{ name: 'theme-color', content: computed(() => colorMode.value === 'dark' ? '#0a0a0a' : '#ffffff') }],
})

useSeoMeta({
  ogSiteName: 'Redon Emini',
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'en_US',
  twitterCard: 'summary',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
