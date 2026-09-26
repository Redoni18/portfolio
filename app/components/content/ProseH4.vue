<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h4 :id="id">
    <a v-if="id" :href="`#${id}`" class="heading-anchor"><slot /><span class="heading-hash" aria-hidden="true">#</span></a>
    <slot v-else />
  </h4>
</template>
