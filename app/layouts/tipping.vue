<script setup lang="ts">
import type { NavigationMenuProps } from '@nuxt/ui'

const { signOut } = useAuth()

const links: NavigationMenuProps['items'] = [
  [
    {
      label: 'Dashboard',
      to: '/tipping',
    },
    {
      label: 'Enter tips',
      to: '/tipping/add-tips',
    },
    {
      label: 'Championships',
      to: '/tipping/championships',
    },
  ],
  [
    {
      label: 'Results',
      to: '/tipping/leaderboard',
    },
    {
      label: 'Groups',
      to: '/tipping/groups',
    },
    {
      label: 'Rules & Scoring',
      to: '/tipping/rules',
    },
  ],
  [
    {
      label: 'Feedback',
      to: '/tipping/contact',
    },
    {
      label: 'Settings',
      to: '/tipping/settings',
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'carbon:exit',
      async onClick() {
        await signOut()
      },
    },
  ],
]

const isMobileNavPresented = ref(false)

const { allUserGroups, currentUserGroup } = await useGroup()
</script>

<template lang="pug">
.is-layout-tipping
  div(class='md:flex md:flex-row')
    // desktop header
    header.border-muted.hidden.space-y-4.border-r(
      class='bg-muted/25 w-[15%] min-w-[10rem] md:block'
    )
      .space-y-1.p-4
        NuxtLink.text-muted.flex.items-center.gap-1(to='/tipping')
          UIcon.transition-colors(
            name='carbon:trophy-filled',
            size='xs',
            class='group-hover:bg-primary'
          )
          span.is-size-7.font-medium GridTip
        template(v-if='!allUserGroups?.length')
          p.is-size-7.italic No group
        template(v-else-if='allUserGroups.length === 1 && currentUserGroup')
          p.is-size-7.italic {{ currentUserGroup.name }}
        template(v-else)
          USelectMenu.w-full(
            :items='allUserGroups',
            v-model='currentUserGroup',
            label-key='name',
            :search-input='false'
          )
      UNavigationMenu.px-1(:items='links', orientation='vertical')
    // mobile header
    header.sticky.top-0.z-10.bg-white(class='md:hidden dark:bg-gray-800')
      .is-container.is-header(class='md:hidden')
        .is-header-wrapper
          .is-header-wrapper-link
            UButton(
              icon='carbon:open-panel-filled-left',
              aria-label='Open mobile navigation',
              variant='ghost',
              @click='isMobileNavPresented = true'
            )
            h1.is-display-6
              slot(name='page-title')
          UButton(
            icon='carbon:home',
            aria-label='Home',
            to='/tipping',
            title='Dashboard',
            variant='ghost'
          )
      USeparator

    main.w-full
      div(class='md:flex md:min-h-screen md:w-full md:flex-col md:overflow-hidden md:p-0')
        .is-container(class='md:px-8 md:py-4')
          h1.is-display-6.hidden(class='md:block')
            slot(name='page-title')
        USeparator.hidden(class='md:block')
        div(class='md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto')
          slot

  USlideover(v-model:open='isMobileNavPresented', side='left')
    template(#title)
      slot(name='page-title')
    template(#body)
      UNavigationMenu(:items='links', orientation='vertical')
</template>

<style>
@reference "../assets/css/main.css";
.is-header {
  @apply space-y-1 py-2;
}
.is-header-wrapper {
  @apply flex items-center justify-between;
}

.is-header-wrapper-link {
  @apply flex items-center gap-2;
}
</style>
