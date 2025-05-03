<script setup lang="ts">
import type { Database } from '~~/types/db'
import type { AvatarProps } from '@nuxt/ui'

defineProps<{
  user: Pick<Database.User, 'name' | 'id'> & { image?: Database.User['image'] }
  avatar?: Partial<AvatarProps>
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
