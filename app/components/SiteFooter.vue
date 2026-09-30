<script setup lang="ts">
import { Download } from '@lucide/vue'

const config = useRuntimeConfig()
const domain = new URL(config.public.siteUrl).host
</script>

<template>
  <!-- Domain | CV | social icons; the equal outer columns keep the CV link truly centered. Phones get the short "CV" label and tighter gaps so all three stay on one row. -->
  <footer class="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 border-t py-6 font-mono text-xs sm:gap-x-6">
    <NuxtLink to="/" class="link-muted justify-self-start">
      {{ domain }}
    </NuxtLink>
    <Button
      as="a"
      variant="ghost"
      size="sm"
      class="font-normal text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
      href="/Redon_Emini_CV.pdf"
      download="Redon_Emini_CV.pdf"
      aria-label="Download CV (PDF)"
    >
      <Download data-icon="inline-start" class="size-4" aria-hidden="true" />
      <span class="sm:hidden">CV</span>
      <span class="hidden sm:inline">Download CV</span>
    </Button>
    <SocialLinks size="icon-sm" icon-class="size-4" class="-mr-2 justify-self-end" />
  </footer>
</template>
