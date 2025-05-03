<script setup lang="ts">
import type { Database } from '~~/types/db'

const { allConstructors: constructors } = await useConstructor()
const selectedConstructor = defineModel<Database.ConstructorFull>()
</script>

<template lang="pug">
USelectMenu.w-full(
  :items='constructors',
  searchable,
  v-model='selectedConstructor'
)
  template(#default='{ modelValue: selectedConstructor }')
    template(v-if='selectedConstructor')
      ConstructorOption(:option='selectedConstructor')
    template(v-else)
      .relative.isolate
        span.text-dimmed.absolute.inset-0.flex.items-center.justify-center Pick a constructor
        ConstructorOption.invisible(
          :option='constructors[0]',
          v-if='constructors?.length'
        )
  template(#item='{ item }')
    ConstructorOption(:option='item')
</template>
