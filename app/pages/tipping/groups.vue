<script setup lang="ts">
import { z } from "zod";
import { createGroup as createGroupSchema } from "~~/shared/schemas";
import type { FormSubmitEvent, Form } from "#ui/types";
const { user } = await useAuthUser();
if (!user?.id) {
  await navigateTo("/auth");
}
const {
  data: groups,
  error,
  refresh: refreshGroups,
} = await useFetch(`/api/user/${user?.id}/get-groups`);

const useCreateGroup = (options?: { runAfterCreate?: () => void }) => {
  const schema = createGroupSchema;
  type Schema = z.output<typeof schema>;
  const isPending = ref(false);
  const toast = useToast();
  const state = reactive({
    name: "",
  });

  return {
    state,
    isPending,
    schema,
    create: async (input: FormSubmitEvent<Schema>) => {
      isPending.value = true;
      try {
        const response = await $fetch("/api/group/create", {
          body: input.data,
          method: "POST",
        });
        console.log(response);
        toast.add(
          $getSuccessToast({
            description: `You have successfully created the group "${input.data.name}".`,
          }),
        );

        // reset form
        state.name = "";

        options?.runAfterCreate?.();
      } catch (e) {
        toast.add({
          title: "Error",
          description: "Something went wrong. Please try again.",
          color: "red",
          icon: "carbon:error",
        });
        console.error(e);
      } finally {
        isPending.value = false;
      }
    },
  };
};

const createGroup = useCreateGroup({
  runAfterCreate: refreshGroups,
});
definePageMeta({
  layout: false,
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Groups
  .space-y-6
    TextHero(:level="2" heading="Your groups" :description="!groups?.items?.length ? 'You are not yet a member of a group. Create a new group or join an existing one.' : ''")
    template(v-if="error")
      p.bg-red-400.p-4.rounded Something went wrong: {{ error }}
    template(v-if="groups?.items?.length")
      ul.flex.flex.gap-2.flex-wrap
        template(v-for="{ group } in groups.items" :key='group.id')
          li
            UButton(:to="`/tipping/${group.id}`" :label="group.name")
    div
      .grid.gap-4(class="sm:grid-cols-2")
        UCard
          template(#header)
            p.is-display-6 Create a new group
          UForm.space-y-4(:schema="createGroup.schema" @submit="createGroup.create" :state="createGroup.state")
            UFormGroup(label="Group name" name="name")
              UInput(v-model="createGroup.state.name")
            UButton(type="submit" label="Create" :disabled="createGroup.isPending.value" :loading="createGroup.isPending.value")
        UCard
          template(#header)
            p.is-display-6 Join a group
          p.text-muted Ask a member of an existing group to send you an invite link to join a group.
</template>
