<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { authClient, user } = useAuth()
const isConfirmDeleteModalPresented = ref(false)

async function onConfirmDelete() {
  try {
    await authClient.deleteUser({
      callbackURL: '/',
    })
  } catch (e) {
    const { add } = useToast()
    add(
      $getErrorToast({
        title: 'Error deleting',
        actions: [
          {
            label: 'Contact',
            onClick: () => {
              navigateTo('/tipping/contact')
            },
          },
        ],
        description:
          (typeof e === 'string' ? e : 'Something went wrong.') +
          ' Please contact us.',
      }),
    )
  }
}

useSeoMeta({
  title: 'Settings',
  ogTitle: 'Settings',
})

const [date = '', commit = ''] =
  useRuntimeConfig().public.version.split(/(?<=\+\d{4})\s/)
</script>

<template lang="pug">
NuxtLayout(name='tipping')
  template(#page-title)
    | Settings
  .is-page-height.is-container.flex.flex-col
    .space-y-4
      TextHero(:level='2', heading='Danger Zone')
      UButton(
        @click='isConfirmDeleteModalPresented = true',
        label='Delete account',
        color='error'
      )
    section.text-faint.mt-auto.space-y-1
      p.is-display-8 Version
      div
        pre.is-size-8.line-clamp-1 {{ commit }}
        p.is-size-8 {{ date }}
  UModal(v-model:open='isConfirmDeleteModalPresented', title='Delete account')
    template(#body)
      .space-y-4
        p Are you sure?
        p This will delete the account
          | {{ ' ' }}
          b {{ (user?.name ?? 'Unknown') + ' ' }}
          template(v-if='user?.email')
            b {{ `(${user?.email}) ` }}
          span and all connected data.
    template(#footer)
      .flex.w-full.items-center.justify-between.gap-2
        UButton(
          @click='isConfirmDeleteModalPresented = false',
          label='Cancel',
          variant='outline'
        )
        UButton(@click='onConfirmDelete', label='Confirm', color='error')
</template>
