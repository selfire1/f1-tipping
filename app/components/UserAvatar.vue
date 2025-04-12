<script setup lang="ts">
import type { Database } from '~~/types/db'

defineProps<{
  user: Pick<Database.User, 'name' | 'id'> & { image?: Database.User['image'] }
}>()
</script>

<template lang="pug">
UAvatar(:alt='user.name', size='sm', :src='$getUserImgSrc(user)')
</template>
