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

// Points agents at the page's markdown copy (server/middleware/markdown.ts).
// Only content pages have one, not the 404 shell. While prerendering, each
// page also queues its copy, since Nitro's crawler doesn't follow .md links.
const markdownCopy = computed(() => {
  const path = route.path === '/' ? '/' : route.path.replace(/\/+$/, '')
  const hasCopy = ['/', '/experience', '/projects'].includes(path) || path.startsWith('/projects/')
  return hasCopy ? markdownPath(path) : undefined
})
if (markdownCopy.value) prerenderRoutes(markdownCopy.value)
useHead({
  link: computed(() => markdownCopy.value
    ? [{ rel: 'alternate', type: 'text/markdown', href: `${config.public.siteUrl}${markdownCopy.value}` }]
    : []),
})

// Site-wide share card: the favicon mark (public/og.png). Project pages replace
// the image, its alt and type with their own preview.
useSeoMeta({
  ogSiteName: 'Redon Emini',
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'en_US',
  ogImage: `${config.public.siteUrl}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageAlt: 'Redon Emini\'s RE monogram: white letters on a black rounded square',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
