<template lang="pug">
div
  header
    AppHeader
  main
    slot
  footer
    UDivider
    .is-container.py-4
      .is-size-8.flex.text-muted
        p
          span {{ 'Built by ' }}
          NuxtLink.text-primary(to='https://joschua.io/', class='hover:underline') Joschua
</template>
