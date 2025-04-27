<script setup lang="ts">
import type { Database } from '~~/types/db'
import type { Avatar } from '#ui/types'

defineProps<{
  user: Pick<Database.User, 'name' | 'id'> & { image?: Database.User['image'] }
  avatar?: Partial<Avatar>
}>()
</script>

<template lang="pug">
UAvatar(
  :alt='user.name',
  size='sm',
  :src='$getUserImgSrc(user)',
  v-bind='avatar ?? {}'
)
</template>
