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
    if (window === undefined) return;
    this.init(window);
  }

  init(window) {
    this.setupDOM(window);
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

  setupDOM(window) {
    this.window = window;

    this.window.classList.add(
      ...["scroll-smooth", "snap-x", "relative", "!overflow-x-hidden"]
    );
    // this.window.style.transitionDuration = "300ms";

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
    this.window.prepend(
      Carousel.createSpacerElement(this.window.offsetWidth / 2)
    );
    this.window.append(
      Carousel.createSpacerElement(this.window.offsetWidth / 2)
    );
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

  static createSpacerElement(width) {
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

export class InfiniteCarousel extends Carousel {
  constructor(window) {
    super();
    this.init(window);
  }

  init(window) {
    this.setupDOM(window);
    this.slideTracker = {
      canonicalIndex: 0,
      absoluteIndex: 0,
      currentSlide: null,
      canonicalCount: this.carousel.childElementCount,
      absoluteCount: this.carousel.childElementCount * 3,
    };
    this.createNavButtons((event) => {
      const target = event.target.dataset.slide;
      this.scrollToNearestCanonical(target);
      this.hasNavigated = true;
    });
    this.numberSlides("canonical");
    this.duplicateSlides();
    this.numberSlides("slide");
    this.balanceSlides();
    this.updateCenters();
    requestAnimationFrame(() => {
      this.scrollTo(this.slideTracker.absoluteIndex);
    });
  }

  incrementCounter() {
    if (this.hasNavigated == true) {
      this.hasNavigated = false;
      return;
    }

    this.slideTracker.absoluteIndex++;
    if (this.slideTracker.absoluteIndex >= this.slideTracker.absoluteCount) {
      this.slideTracker.absoluteIndex = 0;
    }

    this.slideTracker.canonicalIndex++;
    if (this.slideTracker.canonicalIndex >= this.slideTracker.canonicalCount) {
      this.slideTracker.canonicalIndex = 0;
    }
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
      (element) => element.dataset.slide == this.slideTracker.absoluteIndex
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

  scrollToNearestCanonical(canonicalIndex) {
    const diff = canonicalIndex - this.slideTracker.canonicalIndex;
    const newAbsoluteIndex = this.slideTracker.absoluteIndex + diff;

    this.slideTracker.canonicalIndex = canonicalIndex;
    this.slideTracker.absoluteIndex = newAbsoluteIndex;
    this.scrollTo(newAbsoluteIndex);
  }

  scrollTo(absoluteIndex) {
    this.window.scrollLeft = this.centers[absoluteIndex];

    this.buttons.forEach((btn) => {
      if (btn.dataset.slide == this.slideTracker.canonicalIndex) {
        this.styleButton(btn, true);
      } else {
        this.styleButton(btn, false);
      }
    });
  }

  run(interval) {
    setInterval(() => {
      this.incrementCounter();
      this.balanceSlides();
      this.updateCenters();
      requestAnimationFrame(() =>
        this.scrollTo(this.slideTracker.absoluteIndex)
      );
    }, interval);
  }
}
