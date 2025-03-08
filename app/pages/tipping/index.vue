<script setup lang="ts">
const { user } = await useAuthUser();
if (!user?.id) {
  await navigateTo("/auth");
}

const { allUserGroups } = useGroups();

definePageMeta({
  layout: false,
});
const { allRaces } = await useRaces();
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Dashboard
  .is-page-height.is-container
    pre {{ allRaces }}
    .grid.is-grid-card-fit.gap-8
      template(v-if="!allUserGroups?.length")
        UCard
          template(#header)
            TextHero(:level="2" heading="Join or start a group" description="You are not yet a member of a group. Get started tipping by joining or creating a group.")
          UButton(to="/tipping/groups" label="Manage groups")
</template>
