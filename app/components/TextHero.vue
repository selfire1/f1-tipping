<script setup lang="ts">
const props = defineProps<{
  heading?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  description?: string;
}>();

const headingClass = (() => {
  switch (props.level) {
    case 1:
      return "is-display-4";
    case 2:
      return "is-display-5";
    case 3:
      return "is-display-6";
    case 4:
      return "is-display-7";
  }
})();

const descriptionClass = (() => {
  if (props.level <= 3) {
    return "is-size-7";
  }
  return "is-size-6";
})();
</script>

<template lang="pug">
.TextHero.space-y-2
  slot(name="heading")
    component(:is="`h${props.level}`" :class="headingClass") {{ props.heading }}
  .text-muted.text-pretty(v-if="$slots.description || description" :class="descriptionClass")
    slot(name="description")
      p(v-if="description") {{ description }}

</template>
