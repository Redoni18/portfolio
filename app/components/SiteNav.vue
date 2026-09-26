<script setup lang="ts">
const route = useRoute()

// Shared with the page transitions, which slide in tab order (utils/tabs.ts)
const tabs = siteTabs

const path = computed(() => route.path.replace(/(.)\/+$/, '$1'))
</script>

<template>
  <nav aria-label="Main" class="border-b">
    <ul class="-mb-px flex gap-6">
      <li v-for="tab in tabs" :key="tab.to">
        <NuxtLink
          :to="tab.to"
          :aria-current="tab.match(path) ? 'page' : undefined"
          class="inline-flex border-b py-2.5 text-[15px] transition-colors duration-150"
          :class="tab.match(path)
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'"
        >
          {{ tab.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
