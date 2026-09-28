<script setup lang="ts">
import { Mail } from '@lucide/vue'

/** GitHub, LinkedIn, email and Twitch from `content/profile.yml`, rendered as icon-only buttons. Used by the header and footer. */
withDefaults(defineProps<{ size?: 'icon' | 'icon-sm', iconClass?: string }>(), { size: 'icon', iconClass: 'size-5' })

const { data: profile } = await useProfile()
</script>

<template>
  <ul v-if="profile" class="flex flex-wrap items-center gap-1" aria-label="Contact and profiles">
    <li>
      <Button
        as="a"
        variant="ghost"
        :size="size"
        class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
        :href="profile.links.github"
        target="_blank"
        rel="me noopener"
        aria-label="GitHub"
        title="GitHub"
      >
        <IconGithub :class="iconClass" aria-hidden="true" />
      </Button>
    </li>
    <li>
      <Button
        as="a"
        variant="ghost"
        :size="size"
        class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
        :href="profile.links.linkedin"
        target="_blank"
        rel="me noopener"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <IconLinkedin :class="iconClass" aria-hidden="true" />
      </Button>
    </li>
    <li>
      <Button
        as="a"
        variant="ghost"
        :size="size"
        class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
        :href="`mailto:${profile.email}`"
        :aria-label="`Email ${profile.email}`"
        :title="profile.email"
      >
        <Mail :class="iconClass" aria-hidden="true" />
      </Button>
    </li>
    <li>
      <Button
        as="a"
        variant="ghost"
        :size="size"
        class="text-muted-foreground transition-colors duration-150 hover:text-foreground"
        :href="profile.links.twitch"
        target="_blank"
        rel="me noopener"
        aria-label="Twitch"
        title="Twitch"
      >
        <IconTwitch :class="iconClass" aria-hidden="true" />
      </Button>
    </li>
  </ul>
</template>
