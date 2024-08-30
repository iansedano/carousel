import { runAfterFramePaintAsync } from "animation/after-paint";
import { EventQueue } from "animation/event-queue";
import { sleep } from "animation/sleep";
import { Alignment, PlatformCarouselState } from "carousel/carousel-state";
import { Circle } from "components/Circle";
import { debounce } from "lodash-es";

type CarouselTracker = {
  currentState: PlatformCarouselState;
  timeoutId: number;
};

type CarouselHTMLManagerArgs = {
  container: HTMLElement;
  transitionDuration?: number;
  alignment?: Alignment;
  viewWindowClasses: string;
  postRender?: () => void;
};

class CarouselHTMLManager {
  view: HTMLElement;
  platform: HTMLElement;
  navContainer: HTMLElement;
  transitionDuration: number;
  alignment: "center" | "left" | "right";
  postRender: () => void;

  constructor({
    container,
    transitionDuration = 5000,
    alignment = "center",
    viewWindowClasses = "",
    postRender = () => {},
  }: CarouselHTMLManagerArgs) {
    this.transitionDuration = transitionDuration;
    this.postRender = postRender;
    this.alignment = alignment;
    this.generateInitialStructure(container, viewWindowClasses);
  }

  generateInitialStructure(container: HTMLElement, viewWindowClasses = "") {
    const carouselViewWindow = document.createElement(container.tagName);

    if (viewWindowClasses) {
      carouselViewWindow.classList.add(...viewWindowClasses.split(" "));
      carouselViewWindow.classList.add("overflow-hidden");
    }

    carouselViewWindow.classList.add(
      "carousel-view-window",
      "relative",
      "!overflow-x-hidden",
      "!overflow-y-hidden"
    );
    carouselViewWindow.style.height = container.offsetHeight + "px";

    const carouselPlatform = container.cloneNode(true) as HTMLElement;
    carouselPlatform.classList.add(
      "absolute",
      "carousel-platform",
      "transition-[left]",
      "ease-out"
    );
    carouselPlatform.style.transitionDuration = `${this.transitionDuration}ms`;
    carouselPlatform.removeAttribute("id");

    Array.from(container.children).forEach((slide) => {
      const slideElement = slide as HTMLElement;
      slideElement.classList.add(
        "flex-shrink-0",
        "transition-[left]",
        "ease-out"
      );
      slideElement.style.transitionDuration = `${this.transitionDuration}ms`;
    });
    carouselViewWindow.append(carouselPlatform);
    container.replaceWith(carouselViewWindow);
    this.view = carouselViewWindow;
    this.platform = carouselPlatform;
    this.postRender();
  }

  getState(startingIndex = 0) {
    return new PlatformCarouselState(
      {
        view: {
          width: this.view.offsetWidth,
          height: this.view.offsetHeight,
        },
        platform: {
          width: this.platform.offsetWidth,
          position: this.platform.offsetLeft,
        },
        slides: Array.from(this.platform.children).map((element) => {
          const htmlElement = element as HTMLElement;
          return {
            width: htmlElement.offsetWidth,
            position: htmlElement.offsetLeft,
          };
        }),
        idx: startingIndex,
      },
      { align: this.alignment }
    );
  }

  createNavigation(tracker: CarouselTracker, queue: EventQueue) {
    this.navContainer = document.createElement("nav");
    this.navContainer.classList.add(
      "flex",
      "flex-row",
      "justify-center",
      "h-6",
      "text-center",
      "gap-2"
    );
    tracker.currentState.slides.forEach((_, idx) => {
      const button = Circle(10, {
        classList: ["transition-opacity"],
        style: { transitionDuration: `${this.transitionDuration}ms` },
      });
      button.ariaRoleDescription = "button";

      button.addEventListener("click", async (event) => {
        queue.dispatch({
          type: "callback",
          payload: async () => {
            tracker.currentState = tracker.currentState.setState(idx);
            await this.update(tracker.currentState);
          },
        });
      });
      this.navContainer.append(button);
    });
    this.view.after(this.navContainer);
  }

  async update(state: PlatformCarouselState, first = false) {
    this.platform.style.left = `${state.platform.position}px`;
    Array.from(this.navContainer.children).forEach((navButton, i) => {
      if (first) {
        if (state.idx != i) navButton.classList.add("opacity-30");
      } else {
        if (state.idx == i) {
          navButton.classList.remove("opacity-30");
        } else {
          navButton.classList.add("opacity-30");
        }
      }
    });
  }
}

export type CarouselArgs = {
  element: HTMLElement;
  transition?: number;
  interval?: number;
  alignment?: Alignment;
  viewWindowClasses?: string;
  postRender?: () => void;
};

export async function main({
  element,
  transition: transitionDuration = 500,
  interval: carouselInterval = 10000,
  alignment = "center",
  viewWindowClasses = "",
  postRender = () => {},
}: CarouselArgs) {
  const carouselHtml = new CarouselHTMLManager({
    container: element,
    transitionDuration: transitionDuration,
    alignment: alignment,
    viewWindowClasses: viewWindowClasses,
    postRender: postRender,
  });

  const initState = carouselHtml.getState().setState(0);

  const queue = new EventQueue();
  const tracker: CarouselTracker = { currentState: initState, timeoutId: 0 };

  const debouncedDispatch = debounce(() => {
    queue.dispatch({
      type: "callback",
      payload: async () => {
        await sleep(100);
        runAfterFramePaintAsync(async () => {
          tracker.currentState = carouselHtml
            .getState()
            .setState(tracker.currentState.idx);
          runAfterFramePaintAsync(async () => {
            await carouselHtml.update(tracker.currentState, true);
          });
        });
      },
    });
  }, 500);

  const resizeObserver = new ResizeObserver((entries) => {
    debouncedDispatch();
  });
  // There must be a more efficient way than watching the whole body...
  // Maybe once CSS container queries are a thing?
  resizeObserver.observe(document.body);

  const tick = async () => {
    tracker.currentState = tracker.currentState.tickState();
    await carouselHtml.update(tracker.currentState);
  };

  carouselHtml.createNavigation(tracker, queue);
  await carouselHtml.update(tracker.currentState, true);
  await sleep(carouselInterval);
  queue.run(tick, carouselInterval);
  return;
}
