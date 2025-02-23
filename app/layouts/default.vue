<script setup lang="ts"></script>

<template lang="pug">
header
  .is-container.py-2
    NuxtLink.group.flex.flex-col(to="/" title="Home" aria-label="Home")
      .flex.items-center.gap-1
        UIcon.transition-colors(name="carbon:trophy-filled" size="xl" class="group-hover:bg-primary")
        span.is-size-7.font-medium.text-primary GridTipp
      span.is-size-8.italic.text-muted Couchstructors championship
  UDivider
main.min-h-screen.py-4
  NuxtPage
footer.mt-12
  UDivider
  .is-container.py-4
    .is-size-8.text-muted.flex
      p
        span {{ "Built by "}}
        NuxtLink.text-primary(to="https://joschua.io/" class="hover:underline") Joschua 
  
</template>
