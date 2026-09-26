<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)
const heading = computed(() => is404.value ? 'Page not found' : 'Something went wrong')
const message = computed(() => is404.value
  ? 'The page you’re looking for doesn’t exist or has moved.'
  : 'An unexpected error occurred. Please try again in a moment.')

useHead({ title: computed(() => `${props.error.statusCode} · ${heading.value}`), titleTemplate: '%s · Redon Emini' })
useSeoMeta({ robots: 'noindex' })

</script>

<template>
  <SiteShell>
    <div class="py-10">
      <p class="font-mono text-[13px] text-muted-foreground tabular-nums">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">
        {{ heading }}
      </h1>
      <p class="mt-2 text-muted-foreground">
        {{ message }}
      </p>
      <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <!-- Nuxt clears the error automatically on client-side navigation -->
        <NuxtLink to="/" class="link">
          Back to home
        </NuxtLink>
        <NuxtLink to="/projects" class="link-muted">
          All projects
        </NuxtLink>
      </div>
    </div>
  </SiteShell>
</template>
