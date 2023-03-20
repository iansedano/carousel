import { Carousel } from "./carousel";

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
