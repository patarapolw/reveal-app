<template lang="pug">
.eg-slideshow(ref="slideshow")
  slide(v-for="it0, i0 in items" :key="'ss' + i0" :steps="it0.length"
      :enter-prev="animation.enterPrev" :leave-prev="animation.leavePrev"
      :enter-next="animation.enterNext" :leave-next="animation.leaveNext")
    raw(v-for="it1, i1 in it0" :key="'ss' + i0 + 's' + i1" v-if="step === i1 + 1" :code="it1")
</template>

<script lang="ts">
import { Vue, Component, Prop, Mixins, Watch } from "vue-property-decorator";
import Raw from "./Raw.vue";
import { Slideshow } from "eagle.js";

@Component({
  components: { Raw }
})
export default class EagleMarkdown extends Mixins(Slideshow) {
  @Prop() markdown!: string;
  @Prop({default: 0}) line!: number;

  private items: string[][] = [
    [""]
  ];
  private animation: any = {
    enterPrev: "slideInLeft",
    leavePrev: "slideOutRight",
    enterNext: "slideInRight",
    leaveNext: "slideOutLeft"
  };

  mounted() {
    window.addEventListener("keydown", this.keyboardListener);
    this.updateContent();
    this.resizeEagle();

    window.addEventListener("resize", this.resizeEagle)
  }

  beforeDestroyed() {
    window.removeEventListener("resize", this.resizeEagle);
  }

  get slideshowRef() {
    return this.$refs.slideshow as HTMLDivElement;
  }

  resizeEagle() {
    const slideSize = Math.min(this.slideshowRef.clientHeight, this.slideshowRef.clientWidth) * 0.9;
    this.slideshowRef.style.width = `${slideSize}px`;
    this.slideshowRef.style.height = `${slideSize}px`;
  }

  @Watch("markdown")
  updateContent() {
    this.items = this.markdown.split(/^(?:---|===)$/gm).map((el) => el.split(/^--$/gm));
    // const anim = this.animation;
    // this.animation = {};

    this.$nextTick(() => {
      this.findSlides();
      this.watchCursor();

      // this.$nextTick(() => {
      //   this.animation = anim;
      // });
    });;
  }

  @Watch("line")
  watchCursor() {
    let slideNumber = 0;
    let stepNumber = 0;
    let i = 0;
    for (const row of this.markdown.split("\n")) {
      if (/^(?:---|===)$/.test(row)) {
        slideNumber++;
        stepNumber = 0;
      } else if (/^--$/.test(row)) {
        stepNumber++;
      }
      i++;
      if (i >= this.line) {
        break;
      }
    }
    if (this.currentSlideIndex <= slideNumber) {
      this.changeDirection("next");
    } else {
      this.changeDirection("prev");
    }
    this.$nextTick(() => {
      this.currentSlideIndex = slideNumber + 1;
      this.$nextTick(() => {
        this.step = stepNumber + 1;
      });
    })
  }

  destroyed() {
    window.removeEventListener("keydown", this.keyboardListener);
  }

  async keyboardListener(ev: KeyboardEvent) {
    if (ev.code === "ArrowUp") {
      if (this.step > 1) {
        await this.animateSlide("slideOutDown");
        this.previousStep();
        await this.animateSlide("slideInDown");
        
      }
    } else if (ev.code === "ArrowDown") {
      if (this.step < this.items[this.currentSlideIndex - 1].length) {
        await this.animateSlide("slideOutUp");
        this.nextStep();
        await this.animateSlide("slideInUp");
      }
    } else if (ev.code === "ArrowRight") {
      if (this.currentSlideIndex < this.items.length) {
        this.changeDirection("next");
        this.$nextTick(() => {
          this.nextSlide();
        });
      }
    } else if (ev.code === "ArrowLeft") {
      if (this.currentSlideIndex > 1) {
        this.changeDirection("prev");
        this.$nextTick(() => {
          this.previousSlide();
        });
      }
    }
  }

  async animateSlide(animationName: string) {
    const nodes = document.getElementsByClassName("eg-slide");
    const node = nodes[0];
    node.classList.remove("d-none");
    node.classList.add('animated', animationName, "fast");
    await new Promise((resolve) => {
      function handleAnimationEnd() {
        node.classList.remove('animated', animationName, "fast");
        node.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      }
      node.addEventListener('animationend', handleAnimationEnd)
    })
  }
}
</script>

<style lang="scss">
.eg-slideshow {
  background-repeat: repeat;
  height: 100%;
  width: 100%;
  position: relative !important;
  margin: 0 auto;

  .eg-slide {
    overflow: scroll;
    max-height:  80vh;
  }

  .eg-slide-content {
    padding-top: 10px;
    padding-bottom: 10px;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    position: absolute;
    text-align: center;
    font-size: 3vh;

    ul, ol {
      text-align: left;
    }
  }

  table {
    border-collapse: collapse;
  }

  td {
    border: 1px solid black;
    font-size: 3vh;
  }
}
</style>