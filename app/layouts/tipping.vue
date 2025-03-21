<script setup lang="ts">
import type { HorizontalNavigationLink } from "#ui/types";

const { signOut } = useAuth();

const links: HorizontalNavigationLink[][] = [
  [
    {
      label: "Dashboard",
      to: "/tipping",
    },
    {
      label: "Enter tips",
      to: "/tipping/add-tips",
    },
    {
      label: "Championships",
      to: "/tipping/championships",
    },
  ],
  [
    {
      label: "Results",
      to: "/tipping/leaderboard",
    },
    {
      label: "Groups",
      to: "/tipping/groups",
    },
    {
      label: "Rules & Scoring",
      to: "/tipping/rules",
    },
  ],
  [
    {
      label: "Feedback",
      to: "/tipping/contact",
    },
    {
      label: "Settings",
      to: "/tipping/settings",
    },
  ],
  [
    {
      label: "Sign out",
      icon: "carbon:exit",
      async click() {
        await signOut();
      },
    },
  ],
];

const isMobileNavPresented = ref(false);

const { allUserGroups, currentUserGroup } = await useGroup();
</script>

<template lang="pug">
.is-layout-tipping
  div(class="md:flex md:flex-row")
    // desktop header
    header.hidden.space-y-4.border-r(class="w-[15%] min-w-[10rem] bg-gray-50/50 md:block dark:bg-gray-900 dark:border-gray-700")
      .p-4.space-y-1
        NuxtLink.flex.items-center.gap-1.text-muted(to="/tipping")
          UIcon.transition-colors(name="carbon:trophy-filled" size="xs" class="group-hover:bg-primary")
          span.is-size-7.font-medium GridTip
        template(v-if="!allUserGroups?.length")
          p.italic.is-size-7 No group
        template(v-else-if="allUserGroups.length === 1 && currentUserGroup")
          p.italic.is-size-7 {{currentUserGroup.name}}
        template(v-else)
          USelectMenu(:options="allUserGroups" v-model="currentUserGroup" option-attribute="name")
      UVerticalNavigation.px-1(:links)
    // mobile header
    header.z-10.sticky.top-0.bg-white(class="dark:bg-gray-800 md:hidden")
      .is-container.is-header(class="md:hidden")
        .is-header-wrapper
          .is-header-wrapper-link
            UButton(icon="carbon:open-panel-filled-left" aria-label="Open mobile navigation" variant="ghost" @click="isMobileNavPresented = true")
            h1.is-display-6
              slot(name="page-title")
          UButton(icon="carbon:home" aria-label="Home" to="/tipping" title="Dashboard" variant="ghost")
      UDivider

    main.w-full
      div(class="md:w-full md:min-h-screen md:overflow-hidden md:flex md:flex-col md:p-0")
        .is-container(class="md:px-8 md:py-4")
          h1.hidden.is-display-6(class="md:block")
            slot(name="page-title")
        UDivider.hidden(class="md:block")
        div(class="md:overflow-y-auto md:flex md:flex-col md:flex-1 md:min-h-0")
          slot

  USlideover(v-model="isMobileNavPresented" side="left")
    .is-header
      .is-header-wrapper.is-container
        .is-header-wrapper-link
          UButton(icon="carbon:close" aria-label="Open mobile navigation" variant="ghost" @click="isMobileNavPresented = false")
          p.font-bold
            slot(name="page-title")
    UDivider
    .is-container.py-4
      UVerticalNavigation(:links)
</template>

<style>
.is-header {
  @apply py-2 space-y-1;
  &-wrapper {
    @apply flex items-center justify-between;
    &-link {
      @apply flex items-center gap-2;
    }
  }
}
</style>
