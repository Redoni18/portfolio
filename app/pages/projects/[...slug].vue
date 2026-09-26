<script setup lang="ts">
import { ArrowLeft, ArrowRight, ArrowUpRight, PanelLeft } from '@lucide/vue'

definePageMeta({ wide: true })

const route = useRoute()

const path = computed(() => route.path.replace(/(.)\/+$/, '$1'))
const slug = computed(() => {
  const value = route.params.slug
  return (Array.isArray(value) ? value : [value]).filter(Boolean) as string[]
})
const rootPath = computed(() => `/projects/${slug.value[0] ?? ''}`)

// The page transitions also read this (its `featured`) by key: projectPageKey
const { data: page } = await useAsyncData(
  () => projectPageKey(path.value),
  () => queryCollection('projects').path(path.value).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// The page transitions read this too (chapter order): projectDocsKey
const { data: docs } = await useAsyncData(
  () => projectDocsKey(rootPath.value),
  async () => {
    const items = await queryCollection('projects')
      .where('path', 'LIKE', `${rootPath.value}%`)
      .select('path', 'title', 'stem', 'navigation', 'description', 'preview')
      .all()
    const own = items.filter(item => item.path === rootPath.value || item.path.startsWith(`${rootPath.value}/`))
    return sortProjectDocs(own, rootPath.value)
  },
)

const project = computed(() => docs.value?.find(doc => doc.path === rootPath.value))
const projectTitle = computed(() => project.value?.title ?? page.value?.title ?? '')
const isOverview = computed(() => path.value === rootPath.value)
const toc = computed(() => page.value?.body?.toc?.links ?? [])

const currentIndex = computed(() => (docs.value ?? []).findIndex(doc => doc.path === path.value))
const prev = computed(() => currentIndex.value > 0 ? docs.value![currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 ? docs.value![currentIndex.value + 1] : undefined)

const sheetOpen = ref(false)
watch(() => route.path, () => {
  sheetOpen.value = false
})

// "On this page" links inside the sheet: close the sheet first, then scroll once
// the dialog has released its scroll lock and would otherwise refocus the trigger.
const pendingHeading = ref<string | null>(null)
function onSheetTocNavigate(id: string) {
  pendingHeading.value = id
  sheetOpen.value = false
}
function onSheetCloseAutoFocus(event: Event) {
  const id = pendingHeading.value
  if (!id) return
  event.preventDefault()
  pendingHeading.value = null
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
    history.replaceState(history.state, '', `#${id}`)
  })
}

const title = computed(() => isOverview.value ? projectTitle.value : `${page.value?.title} — ${projectTitle.value}`)
const description = computed(() => page.value?.description || `${projectTitle.value}: technical notes by Redon Emini.`)

// Every page of a project shares the project's preview image when it's linked
// anywhere, so a shared link unfurls into the same card as on /projects.
const config = useRuntimeConfig()
const preview = computed(() => project.value?.preview)
const ogImage = computed(() => {
  const src = preview.value?.og ?? preview.value?.src
  return src ? new URL(src, config.public.siteUrl).href : undefined
})

useSeoMeta({
  title,
  ogTitle: computed(() => `${title.value} · Redon Emini`),
  description,
  ogDescription: description,
  ogType: 'article',
  ogImage,
  ogImageAlt: computed(() => preview.value?.alt),
  ogImageWidth: computed(() => ogImage.value ? 1200 : undefined),
  ogImageHeight: computed(() => ogImage.value ? 630 : undefined),
  twitterCard: computed(() => ogImage.value ? 'summary_large_image' : 'summary'),
})
</script>

<template>
  <!--
    xl+: [gutter | 49rem article | gutter]. The middle column is exactly the
    header's content column, so header, tabs and article share one left edge.
    The docs nav hugs the article from the left gutter, the TOC from the right.
    Below xl: the article alone, with both rails in the Contents sheet.

    Between pages of one project only the article slides ("Page transitions" in
    main.css): the docs nav and the Contents button stay put, the TOC
    cross-fades.
  -->
  <div v-if="page" class="xl:grid xl:grid-cols-[minmax(0,1fr)_min(49rem,100%)_minmax(0,1fr)] xl:gap-x-10">
    <!-- Left rail (xl+) -->
    <aside class="hidden xl:flex xl:justify-end">
      <div class="sticky top-8 max-h-[calc(100dvh-4rem)] w-full max-w-52 self-start overflow-y-auto">
        <ProjectDocsNav
          :project-title="projectTitle"
          :root-path="rootPath"
          :docs="docs ?? []"
          :current-path="path"
        />
      </div>
    </aside>

    <article class="page-article min-w-0">
      <!-- Below xl: contents sheet -->
      <div class="docs-contents mb-6 xl:hidden">
        <Sheet v-model:open="sheetOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="sm" class="font-normal">
              <PanelLeft class="size-4" aria-hidden="true" />
              Contents
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-72 overflow-y-auto p-6" @close-auto-focus="onSheetCloseAutoFocus">
            <SheetHeader class="sr-only p-0">
              <SheetTitle>{{ projectTitle }} contents</SheetTitle>
              <SheetDescription>Pages in the {{ projectTitle }} documentation.</SheetDescription>
            </SheetHeader>
            <ProjectDocsNav
              :project-title="projectTitle"
              :root-path="rootPath"
              :docs="docs ?? []"
              :current-path="path"
              @navigate="sheetOpen = false"
            />
            <ProjectToc
              v-if="toc.length"
              :links="toc"
              in-sheet
              class="mt-8 border-t pt-6"
              @navigate="onSheetTocNavigate"
            />
          </SheetContent>
        </Sheet>
      </div>

      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="font-mono text-xs text-muted-foreground">
        <ol class="flex flex-wrap items-center gap-1.5">
          <li>
            <NuxtLink to="/projects" class="link-muted">
              Projects
            </NuxtLink>
          </li>
          <li aria-hidden="true">
            /
          </li>
          <li v-if="isOverview" aria-current="page" class="text-foreground">
            {{ projectTitle }}
          </li>
          <template v-else>
            <li>
              <NuxtLink :to="rootPath" class="link-muted">
                {{ projectTitle }}
              </NuxtLink>
            </li>
            <li aria-hidden="true">
              /
            </li>
            <li aria-current="page" class="text-foreground">
              {{ page.navigation && typeof page.navigation === 'object' && page.navigation.title ? page.navigation.title : page.title }}
            </li>
          </template>
        </ol>
      </nav>

      <header class="mt-4">
        <h1 class="text-2xl font-semibold tracking-tight text-balance">
          <!-- The overview's title morphs from and back into its row on /projects ("Page transitions" in main.css) -->
          <span
            v-if="isOverview"
            class="project-title-morph inline-block"
            :style="{ '--vt-name': projectTitleTransitionName(rootPath) }"
          >{{ page.title }}</span>
          <template v-else>
            {{ page.title }}
          </template>
        </h1>
        <p v-if="page.description" class="mt-2 text-muted-foreground text-pretty">
          {{ page.description }}
        </p>
      </header>

      <!--
        Project metadata (overview page only), one label/value row per pair.
        Phones: a bordered panel with a hairline between rows. sm+: two columns
        between two rules.
      -->
      <dl
        v-if="isOverview"
        class="mt-6 divide-y rounded-lg border text-sm sm:space-y-2 sm:divide-y-0 sm:rounded-none sm:border-x-0 sm:py-4"
      >
        <div v-if="page.period || page.year" class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-6 sm:p-0">
          <dt class="font-mono text-xs leading-6 text-muted-foreground">
            {{ page.period ? 'Period' : 'Year' }}
          </dt>
          <dd class="tabular-nums">
            {{ page.period || page.year }}
          </dd>
        </div>
        <div v-if="page.stack?.length" class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-6 sm:p-0">
          <dt class="font-mono text-xs leading-6 text-muted-foreground">
            Stack
          </dt>
          <dd>
            <ul class="flex flex-wrap gap-1.5" aria-label="Stack">
              <li v-for="tech in page.stack" :key="tech">
                <Badge variant="outline" class="font-mono text-xs font-normal text-muted-foreground">
                  {{ tech }}
                </Badge>
              </li>
            </ul>
          </dd>
        </div>
        <div v-if="page.links?.live || page.links?.repo" class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-6 sm:p-0">
          <dt class="font-mono text-xs leading-6 text-muted-foreground">
            Links
          </dt>
          <dd class="flex flex-wrap gap-x-5 gap-y-1">
            <a v-if="page.links.live" :href="page.links.live" class="link inline-flex items-center gap-1" target="_blank" rel="noopener">
              {{ linkLabel(page.links.live) }} <ArrowUpRight class="size-3.5 text-muted-foreground" aria-hidden="true" />
            </a>
            <a v-if="page.links.repo" :href="page.links.repo" class="link inline-flex items-center gap-1.5" target="_blank" rel="noopener">
              <IconGithub class="size-3.5 text-muted-foreground" /> Source
            </a>
          </dd>
        </div>
      </dl>

      <ContentRenderer
        :value="page"
        class="docs-prose prose prose-neutral mt-8 max-w-none dark:prose-invert"
      />
      <!-- Sentinel for the "On this page" tracker (end of article reached) -->
      <div id="docs-end" aria-hidden="true" />

      <!--
        Prev / next within this project's docs, side by side at every width. The
        empty span keeps Next in the right-hand column when there's no Previous.
      -->
      <nav
        v-if="prev || next"
        aria-label="Previous and next pages"
        class="mt-14 grid grid-cols-2 gap-3 border-t pt-6"
      >
        <NuxtLink
          v-if="prev"
          :to="prev.path"
          class="group rounded-lg border px-4 py-3 transition-colors duration-150 hover:bg-muted/50"
        >
          <span class="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <ArrowLeft class="size-3" aria-hidden="true" /> Previous
          </span>
          <span class="mt-1 block text-sm wrap-break-word text-foreground">{{ docLabel(prev, rootPath) }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink
          v-if="next"
          :to="next.path"
          class="group rounded-lg border px-4 py-3 text-right transition-colors duration-150 hover:bg-muted/50"
        >
          <span class="flex items-center justify-end gap-1 font-mono text-xs text-muted-foreground">
            Next <ArrowRight class="size-3" aria-hidden="true" />
          </span>
          <span class="mt-1 block text-sm wrap-break-word text-foreground">{{ docLabel(next, rootPath) }}</span>
        </NuxtLink>
      </nav>
    </article>

    <!-- Right rail (xl+) -->
    <aside class="hidden xl:flex xl:justify-start">
      <div class="docs-toc sticky top-8 max-h-[calc(100dvh-4rem)] w-full max-w-52 self-start overflow-y-auto">
        <ProjectToc :links="toc" />
      </div>
    </aside>
  </div>
</template>
