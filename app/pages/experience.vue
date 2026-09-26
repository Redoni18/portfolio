<script setup lang="ts">
const { data: roles } = await useAsyncData('experience', async () => {
  const items = await queryCollection('experience').all()
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.start.localeCompare(a.start))
})

// Short contract engagements go after the employment history, under their own label.
const employment = computed(() => roles.value?.filter(role => !role.consulting) ?? [])
const consulting = computed(() => roles.value?.filter(role => role.consulting) ?? [])

const description = 'Work history of Redon Emini: fullstack and frontend roles across TypeScript, Vue/Nuxt, React and Python.'

useSeoMeta({
  title: 'Experience',
  ogTitle: 'Experience · Redon Emini',
  description,
  ogDescription: description,
})
</script>

<template>
  <div>
    <h1 class="sr-only">
      Experience
    </h1>

    <ol class="space-y-0">
      <li v-for="(role, index) in employment" :key="role.id">
        <Separator v-if="index > 0" class="my-8" />
        <ExperienceRole :role="role" />
      </li>
    </ol>

    <AboutSection v-if="consulting.length" id="consulting" label="Consulting" class="mt-12">
      <ol class="space-y-0">
        <li v-for="(role, index) in consulting" :key="role.id">
          <Separator v-if="index > 0" class="my-8" />
          <ExperienceRole :role="role" heading="h3" />
        </li>
      </ol>
    </AboutSection>
  </div>
</template>
