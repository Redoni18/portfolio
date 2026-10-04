<script setup lang="ts">
import type { ProjectSummary } from '~/composables/useProjects'

const { data: projects } = await useProjectList()

const kindLabels: Record<NonNullable<ProjectSummary['kind']>, string> = {
  personal: 'Personal',
  work: 'Work',
}

const description = 'Selected projects by Redon Emini, with technical write-ups and architecture notes.'

useSeoMeta({
  title: 'Projects',
  ogTitle: 'Projects · Redon Emini',
  description,
  ogDescription: description,
})

await useStructuredData()
</script>

<template>
  <div>
    <h1 class="sr-only">
      Projects
    </h1>

    <!--
      Each project is a bordered card: its link preview (the site's own share
      image) full-width on top, then its address, title, pitch and stack. One
      column on phones, two from sm up. Cards in the same row stretch to the same
      height and the stack sits on the bottom edge, so the badge rows line up.

      The title link stretches over the whole card (its ::after covers
      the <li>), so all of it is clickable while the stack's "+N" button stays a
      real button instead of an interactive element nested inside a link.

      The title text sits in its own inline-block so that, on the way to or from
      a project, it can morph into the project page's heading ("Page
      transitions" in main.css). The Personal/Work tag sits flush in the card's
      top-right corner, outside the title, so only the text morphs. It ignores
      clicks so they reach the card link underneath.
    -->
    <ul class="grid gap-4 sm:grid-cols-2">
      <li
        v-for="(project, index) in projects"
        :key="project.path"
        class="relative flex flex-col overflow-hidden rounded-lg border transition-colors duration-150 hover:bg-muted/60 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-foreground"
      >
        <!-- Decorative here: the project's title already names the link -->
        <div
          v-if="project.preview"
          class="aspect-[1200/630] w-full shrink-0 overflow-hidden border-b bg-subtle"
        >
          <img
            :src="project.preview.src"
            alt=""
            width="1200"
            height="630"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
            class="block size-full object-cover"
            :class="project.preview.srcDark ? 'dark:hidden' : ''"
          >
          <img
            v-if="project.preview.srcDark"
            :src="project.preview.srcDark"
            alt=""
            width="1200"
            height="630"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
            class="hidden size-full object-cover dark:block"
          >
        </div>

        <div class="flex min-w-0 flex-1 flex-col px-4 py-3">
          <p
            v-if="linkLabel(project.links?.live ?? project.links?.repo)"
            class="truncate font-mono text-xs text-muted-foreground"
          >
            {{ linkLabel(project.links?.live ?? project.links?.repo) }}
          </p>
          <div class="mt-0.5 flex items-baseline justify-between gap-4">
            <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 class="leading-6 font-medium text-foreground">
                <NuxtLink
                  :to="project.path"
                  class="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none"
                >
                  <span class="project-title-morph inline-block" :style="{ '--vt-name': projectTitleTransitionName(project.path) }">{{ project.title }}</span>
                </NuxtLink>
              </h2>
              <!--
                A notch of the card's own surface, with the card's hairline on its
                open edges, so it reads on dark and light previews alike. Its
                bottom-left corner uses the card's radius; the card's own corner
                clips its top-right.
              -->
              <span
                v-if="project.kind"
                class="pointer-events-none absolute top-0 right-0 rounded-bl-lg border-b border-l bg-background px-2.5 py-1 text-[13px]/4 font-semibold text-foreground"
              >
                {{ kindLabels[project.kind] }} project
              </span>
            </div>
            <span v-if="project.year" class="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {{ project.year }}
            </span>
          </div>
          <p v-if="project.description" class="mt-1 text-[13px]/5 text-muted-foreground text-pretty">
            {{ project.description }}
          </p>
          <!-- Clicks fall through to the card link; only the "+N" button takes them -->
          <StackBadges
            v-if="project.stack?.length"
            :items="project.stack"
            class="pointer-events-none mt-auto pt-3"
          />
        </div>
      </li>
    </ul>

    <p v-if="!projects?.length" class="text-muted-foreground">
      Nothing here yet.
    </p>
  </div>
</template>
