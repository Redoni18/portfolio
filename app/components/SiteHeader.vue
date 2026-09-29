<script setup lang="ts">
const route = useRoute()
const { data: profile } = await useProfile()

const isHome = computed(() => route.path === '/')
const firstName = computed(() => profile.value?.name.split(' ')[0] ?? '')
</script>

<template>
  <div v-if="profile" class="flex items-start justify-between gap-6">
    <!-- Photo left of the greeting; above it on phones, where the column is too narrow for both -->
    <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <img
        src="/redon.webp"
        :alt="profile.name"
        width="112"
        height="112"
        class="size-18 shrink-0 rounded-full border object-cover sm:size-28"
      >

      <div class="min-w-0">
        <h1 v-if="isHome" class="text-[1.75rem] leading-tight font-semibold tracking-tight">
          Hi, I'm <GreetingName :name="firstName" :alias="profile.alias" focusable />.
        </h1>
        <p v-else class="text-[1.75rem] leading-tight font-semibold tracking-tight">
          <NuxtLink to="/" class="rounded-sm transition-colors duration-150 hover:text-foreground/80">
            Hi, I'm <GreetingName :name="firstName" :alias="profile.alias" />.
          </NuxtLink>
        </p>

        <p class="mt-2 text-foreground/80 text-pretty">
          I'm a fullstack engineer and tech lead at
          <a
            v-if="profile.current.companyUrl"
            :href="profile.current.companyUrl"
            class="link"
            target="_blank"
            rel="noopener"
          >{{ profile.current.company }}</a><template v-else>{{ profile.current.company }}</template>, based in {{ profile.location }}. I build my own products on the side.
        </p>

        <div class="mt-2 flex flex-wrap items-center gap-x-1">
          <span class="font-mono text-sm text-muted-foreground">Social Links:</span>
          <SocialLinks />
        </div>
      </div>
    </div>

    <ThemeToggle class="-mt-1 -mr-2 shrink-0" />
  </div>
</template>
