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
      Each project shows its link preview (the site's own share image), then its
      address, title, pitch and stack. On phones that's a bordered card with the
      preview full-width on top and the text below it; from sm up it's a row
      with a small thumbnail on the left and the text on the right.

      The title link stretches over the whole card or row (its ::after covers
      the <li>), so all of it is clickable while the stack's "+N" button stays a
      real button instead of an interactive element nested inside a link.

      The title text sits in its own inline-block so that, on the way to or from
      a project, it can morph into the project page's heading ("Page
      transitions" in main.css). The Personal/Work badge sits beside the title
      rather than inside it, so only the text morphs.
    -->
    <ul class="space-y-4 sm:-mx-3 sm:space-y-1">
      <li
        v-for="(project, index) in projects"
        :key="project.path"
        class="relative flex flex-col overflow-hidden rounded-lg border transition-colors duration-150 hover:bg-muted/60 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-foreground sm:flex-row sm:gap-5 sm:overflow-visible sm:border-0 sm:px-3 sm:py-4"
      >
        <!-- Decorative here: the project's title already names the link -->
        <div
          v-if="project.preview"
          class="aspect-[1200/630] w-full shrink-0 self-start overflow-hidden border-b bg-subtle sm:w-48 sm:rounded-md sm:border"
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

        <div class="min-w-0 flex-1 p-4 sm:p-0">
          <p
            v-if="linkLabel(project.links?.live ?? project.links?.repo)"
            class="truncate font-mono text-[13px] text-muted-foreground"
          >
            {{ linkLabel(project.links?.live ?? project.links?.repo) }}
          </p>
          <div class="mt-0.5 flex items-baseline justify-between gap-4">
            <div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 class="font-medium text-foreground">
                <NuxtLink
                  :to="project.path"
                  class="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none"
                >
                  <span class="project-title-morph inline-block" :style="{ '--vt-name': projectTitleTransitionName(project.path) }">{{ project.title }}</span>
                </NuxtLink>
              </h2>
              <Badge v-if="project.kind" variant="secondary" class="font-normal">
                <span aria-hidden="true">{{ kindLabels[project.kind] }}</span>
                <span class="sr-only">{{ kindLabels[project.kind] }} project</span>
              </Badge>
            </div>
            <span v-if="project.year" class="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
              {{ project.year }}
            </span>
          </div>
          <p v-if="project.description" class="mt-1 text-muted-foreground text-pretty">
            {{ project.description }}
          </p>
          <!-- Clicks fall through to the row link; only the "+N" button takes them -->
          <StackBadges
            v-if="project.stack?.length"
            :items="project.stack"
            class="pointer-events-none mt-3"
          />
        </div>
      </li>
    </ul>

    <p v-if="!projects?.length" class="text-muted-foreground">
      Nothing here yet.
    </p>
  </div>
</template>
