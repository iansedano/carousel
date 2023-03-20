import { scrollWindowX } from "./scroll";
import { Carousel } from "./carousel";

export class SmoothCarousel extends Carousel {
  /**
   * Construct a carousel with a given element.
   *
   * Opts out of initializing if no element passed. To allow derived classes to
   * override initialization.
   *
   * @param {Element} window
   *
   */
  constructor(window) {
    super(window);
  }

  setupDOM() {
    this.window.classList.add(...["relative", "!overflow-x-hidden"]);
    this.carousel = document.createElement("div");
    const carouselClasses = "flex flex-row w-min-fit mx-auto";
    this.carousel.classList.add(...carouselClasses.split(" "));
    const slideClasses = ["flex-shrink-0"];

    Array.from(this.window.children).forEach((element) => {
      element.remove();
      element.classList.add(...slideClasses);
      this.carousel.append(element);
    });
    this.window.prepend(this.carousel);
  }

  scrollTo(slideNumber) {
    scrollWindowX(this.window, this.centers[slideNumber], 3000);

    this.buttons.forEach((btn) => {
      if (btn.dataset.slide == this.currentSlideIndex) {
        this.styleButton(btn, true);
      } else {
        this.styleButton(btn, false);
      }
    });
  }
}
