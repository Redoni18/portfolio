<script setup lang="ts">
import type { ProjectDocLink } from '~/composables/useProjects'

const props = defineProps<{
  projectTitle: string
  rootPath: string
  docs: ProjectDocLink[]
  currentPath: string
}>()

defineEmits<{ navigate: [] }>()

const items = computed(() => props.docs.map(doc => ({
  path: doc.path,
  label: docLabel(doc, props.rootPath),
  active: doc.path === props.currentPath,
})))
</script>

<template>
  <nav aria-label="Project documentation" class="text-sm">
    <NuxtLink to="/projects" class="link-muted inline-flex items-center gap-1" @click="$emit('navigate')">
      <span aria-hidden="true">←</span> All projects
    </NuxtLink>

    <p class="mt-6 font-medium text-foreground">
      {{ projectTitle }}
    </p>

    <ul class="mt-3 border-l">
      <li v-for="item in items" :key="item.path">
        <NuxtLink
          :to="item.path"
          :aria-current="item.active ? 'page' : undefined"
          class="-ml-px block border-l py-1.5 pl-3 transition-colors duration-150"
          :class="item.active
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'"
          @click="$emit('navigate')"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
