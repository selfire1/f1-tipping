<script setup lang="ts">
defineProps<{
  cutoffDate: Date;
}>();
</script>

<template lang="pug">
UCard
  template(#header)
    h2.is-display-7 Tip the Championships
  template(#footer)
    UButton(label="Tip now" to="/tipping/championships" trailing icon="carbon:arrow-right")
  .space-y-4
    .relative.overflow-hidden.py-4.-mx-4.-mt-5(class="sm:-mx-6 sm:-mt-6")
      AppImg.pointer-events-none.opacity-5.h-full.w-full.object-cover.inset-0.absolute(src="https://images.unsplash.com/photo-1514820720301-4c4790309f46?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")
      .px-6
        p.is-size-7.text-muted Drivers’ and Constructors’
        p.is-display-5 Championships
    .is-size-7
      p.is-display-7.flex.items-center.gap-2
        | Tipping closes
        BadgeTimeTo(:date="cutoffDate")
      .flex
        .pl-2
          p {{ cutoffDate.toLocaleString(undefined, { hour: "numeric", minute: "2-digit"}) }}
          p {{ cutoffDate.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" }) }}

</template>
