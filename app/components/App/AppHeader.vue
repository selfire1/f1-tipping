<script setup lang="ts">
const { isSignedIn, signOut } = useAuth()
</script>

<template lang="pug">
.is-container.flex.items-center.justify-between.py-2
  NuxtLink.group.flex.flex-col(to='/', title='Home', aria-label='Home')
    .flex.items-center.gap-1
      UIcon.transition-colors(
        name='carbon:trophy-filled',
        size='xl',
        class='group-hover:bg-primary'
      )
      span.is-size-7.text-primary.font-medium GridTip
    span.is-size-8.italic.text-muted Couchstructors championship
  template(v-if='isSignedIn')
    UButton(@click='signOut', label='Sign out', variant='ghost', size='sm')
UDivider
</template>
