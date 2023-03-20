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
    this.hasNavigated = false;
    this.window = window;
  }

  static fromContainer(element) {
    const carousel = new Carousel(element);
    carousel.init();
    return carousel;
  }

  init() {
    this.setupDOM();
    this.createNavButtons((event) => {
      const target = event.target.dataset.slide;
      this.currentSlideIndex = target;
      this.scrollTo(target);
      this.hasNavigated = true;
    });
    this.numberSlides("slide");
    this.currentSlideIndex = 0;
    this.addPadding();
    requestAnimationFrame(() => {
      this.updateCenters();
      this.scrollTo(this.currentSlideIndex);
    });
  }

  setupDOM() {
    this.window.classList.add(
      ...["scroll-smooth", "snap-x", "relative", "!overflow-x-hidden"]
    );

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
  }

  createNavButtons(clickHandler) {
    const navContainer = document.createElement("nav");
    navContainer.classList.add(...["h-6", "mb-10", "text-center"]);
    this.buttons = [];
    range(this.carousel.childElementCount).forEach((i) => {
      const button = this.createButton(i);
      button.addEventListener("click", clickHandler);
      navContainer.append(button);
      this.buttons.push(button);
    });
    this.window.after(navContainer);
  }

  createButton(idx) {
    const button = document.createElement("button");
    button.dataset.slide = idx;
    button.classList.add(
      ...[
        "rounded-full",
        "text-transparent",
        "bg-white",
        "outline-black",
        "outline-[1px]",
        "outline",
        "w-2",
        "h-2",
        "mx-1",
        "inline-block",
      ]
    );
    return button;
  }

  styleButton(button, active = false) {
    if (active == false) {
      button.classList.add(...["bg-white"]);
      button.classList.remove(...["bg-black"]);
    } else {
      button.classList.add(...["bg-black"]);
      button.classList.remove(...["bg-white"]);
    }
  }

  /**
   * Add empty element either side of carousel to allow the elements at the
   * edges to be centered in the scroll view.
   *
   * With Chrome, adding CSS padding or margin only works to add padding to the
   * left of the scroll view, not seeming to have any effect on the right.
   */
  addPadding() {
    this.window.prepend(this.createSpacerElement(this.window.offsetWidth / 2));
    this.window.append(this.createSpacerElement(this.window.offsetWidth / 2));
  }

  numberSlides(attrib) {
    Array.from(this.carousel.children).forEach(
      (item, idx) => (item.dataset[attrib] = idx)
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

    this.buttons.forEach((btn) => {
      if (btn.dataset.slide == this.currentSlideIndex) {
        this.styleButton(btn, true);
      } else {
        this.styleButton(btn, false);
      }
    });
  }

  incrementCounter() {
    if (this.hasNavigated == true) {
      this.hasNavigated = false;
      return;
    }

    this.currentSlideIndex++;
    if (this.currentSlideIndex >= this.carousel.childElementCount) {
      this.currentSlideIndex = 0;
    }
  }

  createSpacerElement(width) {
    const elem = document.createElement("div");
    elem.style.width = `${width}px`;
    elem.style.flexShrink = 0;
    return elem;
  }

  run(interval) {
    setInterval(() => {
      this.incrementCounter();
      requestAnimationFrame(() => this.scrollTo(this.currentSlideIndex));
    }, interval);
  }
}
