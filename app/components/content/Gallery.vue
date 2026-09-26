<template>
  <!-- `mdc-unwrap="p"` lifts inline `:figure{}` children out of their paragraph -->
  <div class="not-prose my-6 grid gap-4 sm:grid-cols-2 [&>figure]:my-0">
    <slot mdc-unwrap="p" />
  </div>
</template>
