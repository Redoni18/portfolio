<script setup lang="ts">
/**
 * Page chrome. The header, tabs, activity chart and footer always sit in the
 * same centered `max-w-[52rem]` column so nothing jumps between pages.
 *
 * `wide` (project docs) lets <main> span the viewport at xl+ so the page can lay
 * out a symmetric 3-column grid whose middle column is exactly the header's
 * content column (49rem), with the docs nav and TOC in the side gutters.
 * Below xl it is the same 52rem column as every other page.
 *
 * `page-main` and `page-bottom` are what slides and glides in a tab-to-tab page
 * transition, while the header and tabs stay put ("Page transitions" in main.css).
 */
defineProps<{ wide?: boolean }>()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <SkipLink />

    <header class="mx-auto w-full max-w-[52rem] px-4 pt-8 sm:px-6 sm:pt-20">
      <SiteHeader />
      <SiteNav class="mt-8" />
    </header>

    <main
      id="main"
      tabindex="-1"
      class="page-main mx-auto w-full flex-1 px-4 py-8 outline-none sm:px-6 sm:py-10"
      :class="wide ? 'max-w-[52rem] xl:max-w-none' : 'max-w-[52rem]'"
    >
      <slot />
    </main>

    <div class="page-bottom mx-auto w-full max-w-[52rem] px-4 sm:px-6">
      <GithubActivity class="mt-6 border-t pt-8 pb-10" />
      <SiteFooter />
    </div>
  </div>
</template>
