import { zip } from "lodash-es";

const TRANSITION_DURATION = 500;
const DELAY = 1000;

type Dims = {
  width: number;
  height: number;
};

type SlideDims = {
  width: number;
  position: number;
};

type CarouselTracker = {
  currentState: CarouselState;
  timeoutId: number;
};

class CarouselState {
  carouselDims: Dims;
  slides: SlideDims[];
  idx: number;
  previousOffset: number;

  constructor(carouselDims: Dims, slides: SlideDims[], idx: number) {
    this.carouselDims = carouselDims;
    this.slides = slides;
    this.idx = idx;
  }

  initializeState() {
    return new CarouselState(
      { ...this.carouselDims },
      this.slides.reduce((acc: SlideDims[], slide, idx) => {
        if (idx === 0) {
          acc.push({
            ...slide,
            position: this.carouselDims.width / 2 - slide.width / 2,
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

  tickState() {
    if (this.idx == this.slides.length - 1) {
      return this.setState(0);
    }

    return this.setState(this.idx + 1);
  }

  setState(targetIdx: number) {
    const targetPosition =
      this.carouselDims.width / 2 - this.slides[targetIdx].width / 2;

    const diff = targetPosition - this.slides[targetIdx].position;

    return new CarouselState(
      { ...this.carouselDims },
      this.slides.map((slide) => {
        return {
          width: slide.width,
          position: slide.position + diff,
        };
      }),
      targetIdx
    );
  }
}

class CarouselContainer {
  container: HTMLElement;
  navContainer: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.generateInitialStructure();
  }

  generateInitialStructure() {
    const carousel = document.createElement(this.container.tagName);

    carousel.classList.add(
      ...this.container.classList,
      "relative",
      "!overflow-x-hidden"
    );
    const slides = Array.from(this.container.children).map((element) => {
      const htmlElement = element as HTMLElement;
      return htmlElement.cloneNode(true);
    });
    slides.forEach((slide) => {
      const slideElement = slide as HTMLElement;
      slideElement.classList.add("flex-shrink-0", "transition-all", "ease-out");
      slideElement.style.transitionDuration = `${TRANSITION_DURATION}ms`;
    });
    carousel.append(...slides);
    this.container.replaceWith(carousel);
    this.container = carousel;
  }

  getState() {
    return new CarouselState(
      {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
      },
      Array.from(this.container.children).map((element) => {
        const htmlElement = element as HTMLElement;
        return {
          width: htmlElement.offsetWidth,
          position: htmlElement.offsetLeft,
        };
      }),
      0
    );
  }

  createNavigation(tracker: CarouselTracker) {
    this.navContainer = document.createElement("nav");
    this.navContainer.classList.add(
      "flex",
      "flex-row",
      "justify-center",
      "h-6",
      "mb-10",
      "text-center"
    );
    tracker.currentState.slides.forEach((_, idx) => {
      const button = this.createButton();
      button.addEventListener("click", (event) => {
        clearTimeout(tracker.timeoutId);
        tracker.currentState.setState(idx);
      });
      this.navContainer.append(button);
    });
    this.container.after(this.navContainer);
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

  async firstDOMUpdate(state: CarouselState) {
    this.container.style.width = `${state.carouselDims.width}px`;
    this.container.style.height = `${state.carouselDims.height}px`;
    zip(
      state.slides,
      this.container.children,
      this.navContainer.children
    ).forEach(([slideState, child, navButton], i: number) => {
      if (
        child == undefined ||
        slideState == undefined ||
        navButton == undefined
      )
        return;
      const childElement = child as HTMLElement;

      childElement.classList.add("absolute");
      childElement.style.left = `${slideState.position}px`;
      if (state.idx != i) navButton.classList.add("opacity-50");
    });

    return this;
  }

  async updateDOM(state: CarouselState) {
    zip(
      state.slides,
      this.container.children,
      this.navContainer.children
    ).forEach(([slideState, child, navButton], i: number) => {
      if (
        slideState == undefined ||
        child == undefined ||
        navButton == undefined
      )
        return;
      const childElement = child as HTMLElement;
      childElement.style.left = `${slideState.position}px`;
      if (state.idx == i) {
        navButton.classList.remove("opacity-50");
      } else {
        navButton.classList.add("opacity-50");
      }
    });
    await sleep(TRANSITION_DURATION);
    return this;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main(element: HTMLElement) {
  const carouselContainer = new CarouselContainer(element);
  const initState = carouselContainer.getState().initializeState();

  const tracker: CarouselTracker = { currentState: initState, timeoutId: 0 };
  const tick = async () => {
    tracker.currentState = tracker.currentState.tickState();
    await carouselContainer.updateDOM(tracker.currentState);
    tracker.timeoutId = window.setTimeout(() => tick(), DELAY);
  };

  carouselContainer.createNavigation(tracker);
  await carouselContainer.firstDOMUpdate(tracker.currentState);
  await sleep(DELAY);

  tick();
}
