<script setup lang="ts">
import type { ExperienceCollectionItem } from '@nuxt/content'

/** One role on the Experience page: title and dates, company, highlights, stack. */
withDefaults(defineProps<{ role: ExperienceCollectionItem, heading?: 'h2' | 'h3' }>(), { heading: 'h2' })
</script>

<template>
  <article>
    <!--
      Phones: the dates sit above the title as a small eyebrow, like a project's
      address. The heading stays first in the DOM so it's still read first.
      sm+: title on the left, dates on the right.
    -->
    <div class="flex flex-col-reverse gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4 sm:gap-y-0">
      <component :is="heading" class="font-medium text-foreground">
        {{ role.role }}
      </component>
      <p class="font-mono text-[13px] whitespace-nowrap text-muted-foreground tabular-nums sm:text-sm">
        <time :datetime="role.start">{{ formatYearMonth(role.start) }}</time>
        —
        <time v-if="role.end" :datetime="role.end">{{ formatYearMonth(role.end) }}</time>
        <template v-else>
          Present
        </template>
      </p>
    </div>
    <p class="text-muted-foreground">
      <a
        v-if="role.companyUrl"
        :href="role.companyUrl"
        class="link"
        target="_blank"
        rel="noopener"
      >{{ role.company }}</a>
      <span v-else class="text-foreground/90">{{ role.company }}</span>
      <span> · {{ role.location }}</span>
    </p>

    <ul v-if="role.highlights?.length" class="mt-3 list-disc space-y-2 pl-4 text-foreground/85 marker:text-muted-foreground/60 sm:space-y-1">
      <li v-for="highlight in role.highlights" :key="highlight">
        {{ highlight }}
      </li>
    </ul>

    <!-- Phones: one row of badges, the rest behind "+N". sm+: the whole stack -->
    <StackBadges v-if="role.stack?.length" :items="role.stack" class="mt-4 sm:hidden" />
    <ul v-if="role.stack?.length" class="mt-4 hidden flex-wrap gap-1.5 sm:flex" aria-label="Stack">
      <li v-for="tech in role.stack" :key="tech">
        <Badge variant="outline" class="font-mono text-xs font-normal text-muted-foreground">
          {{ tech }}
        </Badge>
      </li>
    </ul>
  </article>
</template>
