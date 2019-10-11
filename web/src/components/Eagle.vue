<template lang="pug">
.eg-theme-gourmet
  .eg-slideshow
    slide(v-for="it0, i0 in items" :key="'ss' + i0" :steps="it0.length")
      raw(v-for="it1, i1 in it0" :key="'ss' + i0 + 's' + i1" :code="it1" v-if="step === i1 + 1"
      @lang="onLangChanged($event, i0, i1)")
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Mixins } from "vue-property-decorator";
import Raw from "./Raw.vue";
import { Slideshow } from "eagle.js";

@Component({
  components: {Raw}
})
export default class EagleView extends Mixins(Slideshow) {
  @Prop() content!: string;

  private items: string[][] = [[""]];

  mounted() {
    this.backBySlide = true;
    this.keyboardNavigation = false;

    window.addEventListener("keydown", this.keyboardListener);

    this.items = this.content.split(/^(?:---|===)$/gm).map((el) => el.split(/^--$/gm));
    this.$nextTick(() => {
      this.findSlides();
    });
  }

  destroyed() {
    window.removeEventListener("keydown", this.keyboardListener);
  }

  onLangChanged(lang: string, i0: number, i1: number) {
    if (i0 === 0 && i1 === 0) {
      this.$emit("lang", lang);
    }
  }

  keyboardListener(ev: KeyboardEvent) {
    switch(ev.code) {
      case "ArrowUp": this.previousStep(); break;
      case "ArrowDown": this.nextStep(); break;
      case "ArrowLeft": this.previousSlide(); break;
      case "ArrowRight": this.nextSlide(); break;
    }
  }
}
</script>

<style lang="scss">
.eg-slideshow {
  background-repeat: repeat;

  .eg-slide-content {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    text-align: center;
    font-size: 15vh;
  }
}
</style>