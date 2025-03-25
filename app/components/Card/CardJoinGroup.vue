<template lang="pug">
UCard
  template(#header)
    TextHero(
      :level='2',
      heading='Join or start a group',
      description='You are not yet a member of a group. Get started tipping by joining or creating a group.'
    )
  UButton(to='/tipping/groups', label='Manage groups')
</template>
