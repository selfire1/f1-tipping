<script setup lang="ts">
import type { Database } from '~~/types/db'

const { allConstructors: constructors } = await useConstructor()
const selectedConstructor = defineModel<Database.Constructor>()
</script>

<template lang="pug">
USelectMenu(
  :options='constructors',
  searchable,
  option-attribute='name',
  v-model='selectedConstructor'
)
  template(#label)
    .text-faint(v-if='!selectedConstructor') Pick a constructor
    div(v-else)
      ConstructorOption(:option='selectedConstructor')
  template(#option='{ option }')
    ConstructorOption(:option='option')
</template>
