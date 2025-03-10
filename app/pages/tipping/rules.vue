<script setup lang="ts">
definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Rules",
  ogTitle: "Rules",
});
</script>

<template lang="pug">
NuxtLayout(name="tipping")
  template(#page-title)
    | Rules and Scoring
  .is-page-height.is-container
    .prose.pb-12
      h2 Scoring
      h3 Grand Prix weekends
      p Each Grand Prix weekend, there are 
        b five points
        | {{ " up for grabs:"}} 
      ul
        li Driver who qualified for the 
          b pole position
          span : 1 point 
        li Driver who finished 
          b first in the Grand Prix
          span : 1 point 
        li Driver who finished in 
          b P10
          span : 1 point 
        li Driver who crosses the finish line
          b  last
          span : 1 point. This excludes “Did Not Finish”s.
      h3 Championships
      p You can bolster your points by correctly predicting the Constructors’ and Drivers’ Championships.
      ul
        li Drivers’ Championship: 15 points
        li Constructors’ Championship: 10 points

      h2 Deadlines
      p All tips for a Grand Prix weekend must be submitted 
        b three hours 
        span before the 
        b start of Qualifying
        span .
      p Tips for the Championships must be submitted 
        b three hours 
        span before the start of 
        b Qualifying 
        span of the 
        b first Grand Prix 
        span of the season.
      p If you miss entering your predictions, you unfortunately miss out on gaining points for the category!
      h2 Results
      p Results are usually available on the 
        b Monday after 
        span the Grand Prix weekend.
      
</template>
