import { InfiniteCarousel } from "./infinite-carousel";
import { scrollWindowX } from "./scroll";

export class InfiniteSmoothCarousel extends InfiniteCarousel {
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

  scrollTo(absoluteIndex) {
    scrollWindowX(this.window, this.centers[absoluteIndex], 3000);

    this.buttons.forEach((btn) => {
      if (btn.dataset.slide == this.slideTracker.canonicalIndex) {
        this.styleButton(btn, true);
      } else {
        this.styleButton(btn, false);
      }
    });
  }
}
