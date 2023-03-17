import { range } from "lodash-es";

export class Carousel {
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
    if (window === undefined) return;
    this.init(window);
  }

  init(window) {
    this.setupDOM(window);
    this.numberSlides();
    this.currentSlide = 0;
    this.addPadding();
    requestAnimationFrame(() => {
      this.updateCenters();
      this.scrollTo(this.currentSlide);
    });
  }

  setupDOM(window) {
    this.window = window;

    const windowClasses =
      "scroll-smooth snap-x transition-all relative overflow-x-hidden";
    this.window.classList.add(...windowClasses.split(" "));

    this.carousel = document.createElement("div");

    const carouselClasses = "flex flex-row w-min-fit mx-auto";
    this.carousel.classList.add(...carouselClasses.split(" "));
    const slideClasses = ["snap-center", "flex-shrink-0"];

    Array.from(this.window.children).forEach((element) => {
      element.remove();
      element.classList.add(...slideClasses);
      this.carousel.append(element);
    });
    this.window.prepend(this.carousel);

    // Create Nav Buttons

    const navContainer = document.createElement("nav");
    range(this.carousel.childElementCount).forEach((a) => console.log(a));
    this.carousel.childElementCount;
  }

  /**
   * Add empty element either side of carousel to allow the elements at the
   * edges to be centered in the scroll view.
   *
   * With Chrome, adding CSS padding or margin only works to add padding to the
   * left of the scroll view, not seeming to have any effect on the right.
   */
  addPadding() {
    this.window.prepend(
      Carousel.createSpacerElement(this.window.offsetWidth / 2)
    );
    this.window.append(
      Carousel.createSpacerElement(this.window.offsetWidth / 2)
    );
  }

  numberSlides() {
    Array.from(this.carousel.children).forEach(
      (item, idx) => (item.dataset.slide = idx)
    );
  }

  updateCenters() {
    this.centers = Array.from(this.carousel.children).reduce((acc, element) => {
      const centerOfElement = element.offsetLeft + element.offsetWidth / 2;
      const windowOffset = this.window.offsetWidth / 2;
      acc[element.dataset.slide] = centerOfElement - windowOffset;
      return acc;
    }, {});
  }

  scrollTo(slideNumber) {
    this.window.scrollLeft = this.centers[slideNumber];
  }

  incrementCounter() {
    this.currentSlide++;
    if (this.currentSlide >= this.carousel.childElementCount) {
      this.currentSlide = 0;
    }
  }

  static createSpacerElement(width) {
    const elem = document.createElement("div");
    elem.style.width = `${width}px`;
    elem.style.flexShrink = 0;
    return elem;
  }

  run(interval) {
    setInterval(() => {
      this.incrementCounter();
      requestAnimationFrame(() => this.scrollTo(this.currentSlide));
    }, interval);
  }
}

export class InfiniteCarousel extends Carousel {
  constructor(window) {
    super();
    this.init(window);
  }

  init(window) {
    this.setupDOM(window);
    this.currentSlide = 0;
    this.duplicateSlides();
    this.numberSlides();
    this.balanceSlides();
    this.updateCenters();
    requestAnimationFrame(() => {
      this.scrollTo(this.currentSlide);
    });
  }

  duplicateSlides() {
    const first = this.carousel.children[0];
    Array.from(this.carousel.children).forEach((element) => {
      this.carousel.insertBefore(element.cloneNode(true), first);
      this.carousel.append(element.cloneNode(true));
    });
  }

  balanceSlides() {
    const half = Math.floor(this.carousel.childElementCount / 2);
    let currentSlideIndex = Array.from(this.carousel.children).findIndex(
      (element) => element.dataset.slide == this.currentSlide
    );

    const first = this.carousel.children[0];
    if (currentSlideIndex + half + 1 <= this.carousel.childElementCount) {
      let slice = Array.from(this.carousel.children).slice(
        currentSlideIndex + half + 1
      );
      slice.forEach((child) => {
        child.remove();
        this.carousel.insertBefore(child, first);
      });
    } else if (currentSlideIndex - half + 1 >= 0) {
      let slice = Array.from(this.carousel.children).slice(
        0,
        currentSlideIndex - half + 1
      );
      slice.forEach((child) => {
        child.remove();
        this.carousel.append(child);
      });
    }
  }

  run(interval) {
    setInterval(() => {
      this.incrementCounter();
      this.balanceSlides();
      this.updateCenters();
      requestAnimationFrame(() => this.scrollTo(this.currentSlide));
    }, interval);
  }
}
