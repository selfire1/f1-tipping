<script setup lang="ts">
const { isSignedIn, authClient } = useAuth();
async function signOut() {
  authClient.signOut();
  await navigateTo({
    path: "/",
    query: {
      ...$getQueryOrigin(QueryOrigin.SignedOut),
    },
  });
  const toast = useToast();
  toast.add({
    title: "Signed out",
    description: "You have been signed out",
  });
}
</script>

<template lang="pug">
header
  .is-container.py-2.flex.items-center.justify-between
    NuxtLink.group.flex.flex-col(to="/" title="Home" aria-label="Home")
      .flex.items-center.gap-1
        UIcon.transition-colors(name="carbon:trophy-filled" size="xl" class="group-hover:bg-primary")
        span.is-size-7.font-medium.text-primary GridTipp
      span.is-size-8.italic.text-muted Couchstructors championship
    template(v-if="isSignedIn")
      UButton(@click="signOut" label="Sign out" variant="ghost" size="sm")
  UDivider
main
  NuxtPage.min-h-screen.py-4.pb-12
footer
  UDivider
  .is-container.py-4
    .is-size-8.text-muted.flex
      p
        span {{ "Built by "}}
        NuxtLink.text-primary(to="https://joschua.io/" class="hover:underline") Joschua 
  
</template>
