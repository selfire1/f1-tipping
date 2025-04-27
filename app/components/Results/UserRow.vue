<script setup lang="ts">
import type { Database } from '~~/types/db'

defineProps<{
  users?: Pick<Database.User, 'name' | 'image' | 'id'>[]
  isCorrect: boolean
}>()
</script>

<template lang="pug">
template(v-if='users?.length')
  .flex.gap-1
    template(v-for='item in users', :key='item.name')
      UTooltip(:text='item.name')
        UChip(
          inset,
          :color='isCorrect ? "green" : "gray"',
          position='bottom-right',
          size='md'
        )
          template(#content)
            UIcon(:name='isCorrect ? "carbon:checkmark" : "carbon:close"')
          UAvatar(:alt='item.name', :src='$getUserImgSrc(item)')
</template>
