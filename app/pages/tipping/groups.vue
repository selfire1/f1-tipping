<script setup lang="ts">
import { z } from 'zod'
import { createGroup as createGroupSchema } from '~~/shared/schemas'
import type { FormSubmitEvent, Form } from '#ui/types'
import type { Database } from '~~/types/db'
const { user } = await useAuthUser()
if (!user?.id) {
  await navigateTo('/auth')
}
const {
  allUserGroups: groups,
  error,
  refresh: refreshGroups,
} = await useGroup()

const useCreateGroup = (options?: { runAfterCreate?: () => void }) => {
  const schema = createGroupSchema
  type Schema = z.output<typeof schema>
  const isPending = ref(false)
  const toast = useToast()
  const state = reactive({
    name: '',
  })

  return {
    state,
    isPending,
    schema,
    create: async (input: FormSubmitEvent<Schema>) => {
      isPending.value = true
      try {
        const response = await $fetch('/api/group/create', {
          body: input.data,
          method: 'POST',
        })
        console.log(response)
        toast.add(
          $getSuccessToast({
            description: `You have successfully created the group "${input.data.name}".`,
          }),
        )

        // reset form
        state.name = ''

        options?.runAfterCreate?.()
      } catch (e) {
        toast.add(
          $getErrorToast({
            title: 'Error',
            description: 'Something went wrong. Please try again.',
          }),
        )
        console.error(e)
      } finally {
        isPending.value = false
      }
    },
  }
}

const createGroup = useCreateGroup({
  runAfterCreate: refreshGroups,
})
definePageMeta({
  layout: false,
})
const columns = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'id',
    label: 'Link',
  },
]

function copyGroupInviteLink(group: Database.Group) {
  const baseUrl = window.location.origin
  navigator.clipboard.writeText(`${baseUrl}/join/${group.id}`)
  const toast = useToast()
  toast.add(
    $getSuccessToast({
      title: 'Copied link for ' + group.name,
      description: 'Send it to your friends to join!',
    }),
  )
}

useSeoMeta({
  title: 'Groups',
  ogTitle: 'Groups',
})
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Groups
  .is-page-height.is-container.space-y-6
    UCard
      template(#header)
        TextHero(
          :level='2',
          heading='Your groups',
          :description='!groups?.length ? "You are not yet a member of a group. Create a new group or join an existing one." : ""'
        )
      template(v-if='error')
        p.rounded.bg-red-200.p-4 Something went wrong: {{ error }}
      template(v-if='groups?.length')
        UTable(:columns, :rows='groups')
          template(#id-data='{ row }')
            UButton(
              type='button',
              label='Copy invite link',
              @click='copyGroupInviteLink(row)',
              variant='soft',
              icon='carbon:link'
            )
    div
      .grid.gap-4(class='md:grid-cols-2')
        UCard
          template(#header)
            p.is-display-6 Create a new group
          UForm.space-y-4(
            :schema='createGroup.schema',
            @submit='createGroup.create',
            :state='createGroup.state'
          )
            UFormField(label='Group name', name='name')
              UInput(v-model='createGroup.state.name')
            UButton(
              type='submit',
              label='Create',
              :disabled='createGroup.isPending.value',
              :loading='createGroup.isPending.value'
            )
        UCard
          template(#header)
            p.is-display-6 Join a group
          p.text-muted Ask a member of an existing group to send you an invite link to join a group.
</template>
