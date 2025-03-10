<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { authClient } = useAuth();
const isConfirmDeleteModalPresented = ref(false);
const { data } = await authClient.useSession(useFetch);
async function onConfirmDelete() {
  try {
    await authClient.deleteUser({
      callbackURL: "/",
    });
  } catch (e) {
    const { add } = useToast();
    add(
      $getErrorToast({
        title: "Error deleting",
        click: () => {
          navigateTo("/tipping/contact");
        },
        description:
          (typeof e === "string" ? e : "Something went wrong.") +
          " Please contact us.",
      }),
    );
  }
}

useSeoMeta({
  title: "Settings",
  ogTitle: "Settings",
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Settings
  .is-page-height.is-container
    .space-y-4
      TextHero(:level="2" heading="Danger Zone")
      UButton(@click="isConfirmDeleteModalPresented = true" label="Delete account" color="red")
  UModal(v-model="isConfirmDeleteModalPresented")
    UCard
      template(#header)
        TextHero(:level="3" heading="Delete account")
          template(#description)
            p Are you sure? This will delete the account 
              b {{ data?.user.name }}
              b {{ ` (${data?.user.email}) ` }}
              span and all connected data.
      .flex.items-center.justify-between
        UButton(@click="isConfirmDeleteModalPresented = false" label="Cancel" variant="outline")
        UButton(@click="onConfirmDelete" label="Confirm" color="red")
              
</template>
