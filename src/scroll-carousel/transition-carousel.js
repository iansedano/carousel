import { zip } from "lodash-es";

class Carousel {
  constructor(carouselView, slides) {
    this.carouselView = carouselView;
    this.slides = slides;
  }

  static fromContainer(container) {
    return new Carousel(
      {
        width: container.offsetWidth,
        height: container.offsetHeight,
      },
      Array.from(container.children).map((element) => {
        return {
          width: element.offsetWidth,
          height: element.offsetHeight,
          position: element.offsetLeft,
        };
      })
    );
  }

  static generateInitialStructure(container) {
    const carousel = document.createElement(container.tagName);

    carousel.classList.add(
      ...container.classList,
      "relative",
      "!overflow-x-hidden"
    );
    const slides = Array.from(container.children).map((element) =>
      element.cloneNode(true)
    );
    slides.forEach((slide) => {
      slide.classList.add(/*"snap-center",*/ "flex-shrink-0", "transition-all");
    });
    carousel.append(...slides);
    return carousel;
  }

  initializeState() {
    return new Carousel(
      { ...this.carouselView },
      this.slides.reduce((acc, slide, idx) => {
        if (idx === 0) {
          acc.push({
            ...slide,
            position: this.carouselView.width / 2 - slide.width / 2,
          });
          return acc;
        }
        acc.push({
          ...slide,
          position: acc[idx - 1].position + acc[idx - 1].width,
        });
        return acc;
      }, [])
    );
  }

  tickState() {
    const idxAtCenter = this.slides.findIndex((slide) => {
      return slide.position + slide.width / 2 == this.carouselView.width / 2;
    });

    if (idxAtCenter == this.slides.length - 1) {
      return this.initializeState();
    }

    const width =
      this.slides[idxAtCenter + 1].position +
      this.slides[idxAtCenter + 1].width / 2 -
      this.carouselView.width / 2;

    return new Carousel(
      { ...this.carouselView },
      this.slides.map((slide) => {
        return {
          ...slide,
          position: slide.position - width,
        };
      })
    );
  }

  async firstDOMUpdate(container) {
    container.style.width = `${this.carouselView.width}px`;
    container.style.height = `${this.carouselView.height}px`;
    zip(container.children, this.slides).forEach(([child, slideState]) => {
      child.classList.add("absolute");
      child.style.left = `${slideState.position}px`;
      child.style.transitionDelay = `1s`;
      child.style.transform = `translate(-${slideState.width}px)`;
    });

    await sleep(1100);
    return this;
  }

  async updateDOM(container) {
    zip(container.children, this.slides).forEach(([child, slideState]) => {
      child.style.left = `${slideState.position}px`;
      child.style.transitionDelay = `1s`;
      child.style.transform = `translate(-${slideState.width}px)`;
    });
    await sleep(1100);
    return this;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main(element) {
  const newCarouselDOM = Carousel.generateInitialStructure(element);
  element.parentNode.replaceChild(newCarouselDOM, element);
  const carousel = Carousel.fromContainer(newCarouselDOM).initializeState();
  await carousel.firstDOMUpdate(newCarouselDOM);
  let state = carousel;
  while (true) {
    state = state.tickState();
    await state.updateDOM(newCarouselDOM);
  }
}
