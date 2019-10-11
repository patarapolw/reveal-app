declare module "vue-disqus";
declare module "vue-codemirror";
declare module "eagle.js" {
  import { Vue, Component } from "vue-property-decorator";

  export default Eagle;
  
  const Eagle: {
    install: (vue: any, options: any) => void;
    use: (it: any, options?: any) => void;
  };

  @Component
  export class Slideshow extends Vue {
    firstSlide: number;
    lastSlide: number | null;
    startStep: number;
    mouseNavigation: boolean;
    keyboardNavigation: boolean;
    embedded: boolean;
    inserted: boolean;
    onStartExit: boolean;
    onEndExit: boolean;
    backBySlide: boolean;
    repeat: boolean;
    zoom: boolean;

    findSlides(): void;
    nextStep(): void;
    previousStep(): void;
    nextSlide(): void;
    previousSlide(): void;
  }
}