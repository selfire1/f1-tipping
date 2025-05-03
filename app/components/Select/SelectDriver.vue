<script setup lang="ts">
import type { Component } from '~~/types'
import type { Database } from '~~/types/db'

defineProps<{
  drivers: Array<Database.Driver | Component.DriverOption>
}>()

const selectedDriver = defineModel<Database.Driver | Component.DriverOption>()
</script>

<template lang="pug">
USelectMenu.w-full(
  :items='drivers?.sort((driverA, driverB) => driverA.familyName.localeCompare(driverB.familyName))',
  v-model='selectedDriver',
  :filter-fields='["fullName"]',
  by='id',
  placeholder='Pick a driver'
)
  template(#default='{ modelValue: selectedDriver }')
    template(v-if='selectedDriver')
      DriverOption(:option='selectedDriver')
  template(#item='{ item }')
    DriverOption(:option='item')
</template>
