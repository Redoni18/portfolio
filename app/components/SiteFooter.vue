<script setup lang="ts">
import { Download } from '@lucide/vue'

const config = useRuntimeConfig()
const domain = new URL(config.public.siteUrl).host
</script>

<template>
  <!-- Domain | CV | social icons; the equal outer columns keep the CV link truly centered. On phones the CV link drops to its own centered row. -->
  <footer class="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-t py-6 font-mono text-xs sm:grid-cols-[1fr_auto_1fr]">
    <NuxtLink to="/" class="link-muted justify-self-start">
      {{ domain }}
    </NuxtLink>
    <Button
      as="a"
      variant="ghost"
      size="sm"
      class="col-span-2 row-start-2 justify-self-center font-normal text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground sm:col-span-1 sm:row-start-auto"
      href="/Redon_Emini_CV.pdf"
      download="Redon_Emini_CV.pdf"
      aria-label="Download CV (PDF)"
    >
      <Download data-icon="inline-start" class="size-4" aria-hidden="true" />
      Download CV
    </Button>
    <SocialLinks size="icon-sm" icon-class="size-4" class="-mr-2 justify-self-end" />
  </footer>
</template>
