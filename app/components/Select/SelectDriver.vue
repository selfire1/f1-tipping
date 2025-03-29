<script setup lang="ts">
import type { Component } from '~~/types'
import type { Database } from '~~/types/db'

defineProps<{
  drivers: Array<Database.Driver | Component.DriverOption>
}>()

const selectedDriver = defineModel<Database.Driver | Component.DriverOption>()
</script>

<template lang="pug">
USelectMenu(
  :options='drivers?.sort((driverA, driverB) => driverA.familyName.localeCompare(driverB.familyName))',
  searchable,
  option-attribute='fullName',
  v-model='selectedDriver',
  by='id'
)
  template(#label)
    .text-faint(v-if='!selectedDriver') Pick a driver
    div(v-else)
      DriverOption(:option='selectedDriver')
  template(#option='{ option }')
    DriverOption(:option)
</template>
