<script setup lang="ts">
const { data: about } = await useAsyncData('about', () => queryCollection('about').first())
const { data: projects } = await useProjectList()

// The page transitions pick the same projects (featured) to morph (middleware/view-transition.global.ts)
const featured = computed(() => (projects.value ?? []).filter(project => project.featured))

const title = 'Redon Emini — Fullstack Engineer'
const description = computed(() =>
  about.value?.description
  || 'Fullstack engineer in Pristina, Kosovo, building with TypeScript, Vue/Nuxt and Python.')

useHead({ title, titleTemplate: null })
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const siteUrl = useRuntimeConfig().public.siteUrl
await useStructuredData(() => [{
  '@type': 'ProfilePage',
  '@id': `${siteUrl}/#profilepage`,
  'url': `${siteUrl}/`,
  'name': title,
  'description': description.value,
  'isPartOf': { '@id': schemaIds(siteUrl).website },
  'mainEntity': { '@id': schemaIds(siteUrl).person },
}])
</script>

<template>
  <div class="space-y-10">
    <ContentRenderer
      v-if="about"
      :value="about"
      class="prose prose-neutral max-w-none dark:prose-invert"
    />

    <AboutSection v-if="featured.length" id="selected-projects" label="Selected projects">
      <template #action>
        <NuxtLink to="/projects" class="link-muted">
          All projects →
        </NuxtLink>
      </template>
      <ul class="space-y-4">
        <li v-for="project in featured" :key="project.path">
          <div class="flex items-baseline justify-between gap-4">
            <!--
              The name morphs into (and back out of) the project page's heading
              ("Page transitions" in main.css). As a flex item the link is one box
              that hugs the text, so it carries the name itself; no inner
              inline-block, which would drop the underline.
            -->
            <NuxtLink
              :to="project.path"
              class="project-title-morph link font-medium"
              :style="{ '--vt-name': projectTitleTransitionName(project.path) }"
            >
              {{ project.title }}
            </NuxtLink>
            <span v-if="project.year" class="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">{{ project.year }}</span>
          </div>
          <p v-if="project.description" class="mt-0.5 text-muted-foreground">
            {{ project.description }}
          </p>
        </li>
      </ul>
    </AboutSection>
  </div>
</template>
