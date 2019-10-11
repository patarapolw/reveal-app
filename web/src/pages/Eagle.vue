<template lang="pug">
eagle(:content="content")
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Eagle from "../components/Eagle.vue";

@Component({
  name: "EagleView",
  components: {Eagle}
})
export default class EaglePage extends Vue {
  content: string = `
p0

--

p1

--

p2

===

t0

--

t1

--

t2

===

r0

--

r1

--

  `;

  mounted() {
    window.eagle = this;
  }
}
</script>