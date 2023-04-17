import { zip } from "lodash-es";

const TRANSITION_DURATION = 500;

type _Carousel = {
  carouselView: CarouselView;
  slides: Slide[];
};

type CarouselView = {
  width: number;
  height: number;
};

type Slide = {
  width: number;
  position: number;
};

class Carousel {
  carouselView: CarouselView;
  slides: Slide[];
  idx: number;
  previousOffset: number;

  constructor(carouselView: CarouselView, slides: Slide[], idx: number) {
    this.carouselView = carouselView;
    this.slides = slides;
    this.idx = idx;
  }

  static fromContainer(container: HTMLElement) {
    return new Carousel(
      {
        width: container.offsetWidth,
        height: container.offsetHeight,
      },
      Array.from(container.children).map((element) => {
        const htmlElement = element as HTMLElement;
        return {
          width: htmlElement.offsetWidth,
          position: htmlElement.offsetLeft,
        };
      }),
      0
    );
  }

  static generateInitialStructure(container: HTMLElement) {
    const carousel = document.createElement(container.tagName);

    carousel.classList.add(
      ...container.classList,
      "relative",
      "!overflow-x-hidden"
    );
    const slides = Array.from(container.children).map((element) => {
      const htmlElement = element as HTMLElement;
      return htmlElement.cloneNode(true);
    });
    slides.forEach((slide) => {
      const slideElement = slide as HTMLElement;
      slideElement.classList.add("flex-shrink-0", "transition-all", "ease-out");
      slideElement.style.transitionDuration = `${TRANSITION_DURATION}ms`;
    });
    carousel.append(...slides);
    return carousel;
  }

  initializeState() {
    return new Carousel(
      { ...this.carouselView },
      this.slides.reduce((acc: Slide[], slide, idx) => {
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
      }, []),
      0
    );
  }

  createNavigation(container: HTMLElement) {
    const navContainer = document.createElement("nav");
    navContainer.classList.add(
      "flex",
      "flex-row",
      "justify-center",
      "h-6",
      "mb-10",
      "text-center"
    );
    this.slides.forEach(() => {
      const button = this.createButton();
      navContainer.append(button);
    });
    container.after(navContainer);
    return navContainer;
  }

  createButton() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("role", "button");
    svg.classList.add("transition-all");
    svg.style.transitionDuration = `${TRANSITION_DURATION}ms`;

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");

    svg.appendChild(circle);

    return svg;
  }

  tickState() {
    if (this.idx == this.slides.length - 1) {
      return this.setState(0);
    }

    return this.setState(this.idx + 1);
  }

  setState(targetIdx: number) {
    const targetPosition =
      this.carouselView.width / 2 - this.slides[targetIdx].width / 2;

    const diff = targetPosition - this.slides[targetIdx].position;

    return new Carousel(
      { ...this.carouselView },
      this.slides.map((slide) => {
        return {
          width: slide.width,
          position: slide.position + diff,
        };
      }),
      targetIdx
    );
  }

  async firstDOMUpdate(container: HTMLElement, navContainer: HTMLElement) {
    container.style.width = `${this.carouselView.width}px`;
    container.style.height = `${this.carouselView.height}px`;
    zip(this.slides, container.children, navContainer.children).forEach(
      ([slideState, child, navButton], i: number) => {
        child.classList.add("absolute");
        child.style.left = `${slideState.position}px`;
        if (this.idx != i) navButton.classList.add("opacity-50");
      }
    );

    return this;
  }

  async updateDOM(container: HTMLElement, navContainer: HTMLElement) {
    zip(this.slides, container.children, navContainer.children).forEach(
      ([slideState, child, navButton], i: number) => {
        child.style.left = `${slideState.position}px`;
        if (this.idx == i) {
          navButton.classList.remove("opacity-50");
        } else {
          navButton.classList.add("opacity-50");
        }
      }
    );
    await sleep(TRANSITION_DURATION);
    return this;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main(element: HTMLElement) {
  const delay = 1000;
  const carousel = Carousel.generateInitialStructure(element);
  if (element.parentNode == null) throw new Error("No parent node found");
  element.parentNode.replaceChild(carousel, element);
  const initState = Carousel.fromContainer(carousel).initializeState();
  const nav = initState.createNavigation(carousel);
  await initState.firstDOMUpdate(carousel, nav);
  await sleep(delay);
  let state = initState;
  let timeoutId: number;

  const tick = async (state: Carousel) => {
    state = state.tickState();
    await state.updateDOM(carousel, nav);
    timeoutId = window.setTimeout(() => tick(state), delay);
    console.log(timeoutId);
  };
  tick(state);
}
