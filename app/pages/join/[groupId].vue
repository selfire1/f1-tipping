<script setup lang="ts">
import { FetchError } from "ofetch";
const groupId = useRoute().params.groupId as string;
if (!groupId) {
  throw createError({ statusCode: 404, message: "No valid id found." });
}
const { authClient } = useAuth();
const { data: loggedIn } = await authClient.useSession(useFetch);
const { data, status } = await useFetch(`/api/group/get/${groupId}`);
if (!data.value?.item) {
  throw createError({
    statusCode: 404,
    message: "The group was not found.",
  });
}
const authPath = {
  path: "/auth",
  query: {
    redirect: "/join/" + groupId,
    ...$getQueryOrigin(QueryOrigin.Join),
  },
};

const { add: addToast } = useToast();

const {
  run: joinGroup,
  isPending,
  fetchError: error,
} = useFetchFunction({
  try: async () => {
    const response = await $fetch("/api/group/join/" + groupId, {
      method: "POST",
    });
    console.log(response);
    addToast(
      $getSuccessToast({
        title: "Joined" + data.value?.item?.name,
        description: "You successfully joined a new group. Start tipping now!",
      }),
    );
    await navigateTo("/tipping");
  },
});

useSeoMeta({
  title: "Join Group",
  ogTitle: "Join Group",
});
</script>

<template lang="pug">
.is-bg-pattern.is-page-height
  .is-container.flex
    ClientOnly(fallbackTag="div")
      template(#fallback)
        USkeleton(class="h-[42px] w-[300px]")
      UCard.mx-auto.max-w-prose.text-center.w-full
        template(#header)
          .space-y-8
            TextHero(:level="1")
              template(#heading)
                h1.flex.flex-col
                  span.is-size-7.text-muted You’ve been invited to join
                  template(v-if="status === 'pending'")
                    USkeleton(class="h-[42px] w-[300px]")
                  template(v-else)
                    span.is-display-4 {{ data?.item?.name ?? "Unknown group" }}
        template(v-if="error")
          SystemError(:fetch-error="error")
        template(v-if="!loggedIn")
          UButton(:to="authPath" label="Log in or sign up to join")
        template(v-else)
          UButton(@click="joinGroup" label="Join Group" :loading="isPending" :disabled="isPending")

</template>
