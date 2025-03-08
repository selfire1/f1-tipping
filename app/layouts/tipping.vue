<script setup lang="ts">
import type { HorizontalNavigationLink } from "#ui/types";
import type { Database } from "~~/types/db";
const links: HorizontalNavigationLink[][] = [
  [
    {
      label: "Dashboard",
      to: "/tipping",
    },
    {
      label: "Leaderboard",
      to: "/tipping/leaderboard",
    },
    {
      label: "Groups",
      to: "/tipping/groups",
    },
  ],
  [
    {
      label: "Preferences",
      to: "/tipping/settings",
    },
  ],
];

const isMobileNavPresented = ref(false);

// fetch inital groups
const nuxtApp = useNuxtApp();
const { authClient } = useAuth();
const { data } = await authClient.useSession(useFetch);
const allUserGroupsState = useState<Database.Group[] | undefined>(
  STATE_KEYS.usersGroupCache,
  () => [],
);
const { data: allUserGroupsApi } = await useFetch(
  `/api/user/${data.value?.user.id}/get-groups`,
  {
    transform(data) {
      return data.items?.map((el) => ({
        ...el.group,
        createdAt: new Date(el.group.createdAt),
      }));
    },
    getCachedData: (key) =>
      nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  },
);
allUserGroupsState.value = allUserGroupsApi.value;
const { currentUserGroup, allUserGroups } = useGroups();
</script>

<template lang="pug">
div
  .hidden(class="md:flex md:flex-row")
    aside.space-y-4.border-r(class="w-[15%] min-w-[10rem] bg-gray-50/50")
      .p-4.space-y-1
        .flex.items-center.gap-1.text-muted
          UIcon.transition-colors(name="carbon:trophy-filled" size="xs" class="group-hover:bg-primary")
          span.is-size-7.font-medium GridTipp
        template(v-if="!allUserGroups?.length")
          p.italic.is-size-7 No group
        template(v-else-if="allUserGroups.length === 1 && currentUserGroup")
          p.italic.is-size-7 {{currentUserGroup.name}}
        template(v-else)
          USelectMenu(:options="allUserGroups" v-model="currentUserGroup" option-attribute="name")
      UVerticalNavigation.px-1(:links)

    
    .w-full.h-screen.overflow-hidden.flex.flex-col
      header.px-8.py-4
        h1.is-display-6
          slot(name="page-title")
      UDivider
      main.px-8.py-4.overflow-y-auto.flex.flex-col.flex-1.min-h-0
        slot

  div(class="md:hidden")
    header.sticky.top-0.bg-white(class="dark:bg-gray-800")
      .is-container.is-header
        .is-header-wrapper
          .is-header-wrapper-link
            UButton(icon="carbon:open-panel-filled-left" aria-label="Open mobile navigation" variant="ghost" @click="isMobileNavPresented = true")
            h1.is-display-6
              slot(name="page-title")
          template(v-if="!allUserGroups?.length")
            p.italic.is-size-7.text-muted No group
          template(v-else-if="allUserGroups.length === 1 && currentUserGroup")
            p.italic.is-size-7.text-muted {{currentUserGroup.name}}
          template(v-else)
            USelectMenu(:options="allUserGroups" v-model="currentUserGroup" option-attribute="name")

      UDivider

    main
      .is-container.min-h-screen.py-4.pb-12
        slot

  USlideover(v-model="isMobileNavPresented" side="left")
    .is-header
      .is-header-wrapper.is-container
        .is-header-wrapper-link
          UButton(icon="carbon:close" aria-label="Open mobile navigation" variant="ghost" @click="isMobileNavPresented = false")
          p.font-bold Page title
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
