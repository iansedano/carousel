export function main(element) {
  const newCarouselDOM = generateInitialStructure(element);
  element.parentNode.replaceChild(newCarouselDOM, element);
  const carouselStartState = getStateFromContainer(newCarouselDOM);
  const initializedState = initializeState(carouselStartState);
  console.log(initializedState);
}

function validateDOMStructure(element) {
  if (element.children.length === 0) {
    throw new Error("Carousel must have at least one slide");
  }
}

function generateInitialStructure(container) {
  const carousel = document.createElement(container.tagName);

  carousel.classList.add(
    ...container.classList,
    "relative",
    "overflow-x-hidden"
  );
  const slides = Array.from(container.children).map((element) =>
    element.cloneNode(true)
  );
  slides.forEach((slide) => {
    slide.classList.add("snap-center", "flex-shrink-0", "transition-all");
  });
  carousel.append(...slides);
  return carousel;
}

/**
 * @param {HTMLElement} container
 */
function getStateFromContainer(container) {
  return {
    carouselView: {
      width: container.offsetWidth,
      height: container.offsetHeight,
      classList: Array.from(container.classList),
      tagName: container.tagName,
    },
    slides: Array.from(container.children).map((element) => {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight,
        position: element.offsetLeft,
        classList: Array.from(element.classList),
        tagName: element.tagName,
      };
    }),
  };
}

function setFirstSlideToCenter(state) {
  const { carouselView, slides } = state;
  const firstSlide = slides[0];
  const firstSlideCenter = firstSlide.position + firstSlide.width / 2;
  const carouselCenter = carouselView.width / 2;
  const offset = carouselCenter - firstSlideCenter;
  slides.forEach((slide) => {
    slide.position += offset;
  });
  return {
    carouselView,
    slides,
  };
}

function initializeState(state) {
  return {
    carouselView: { ...state.carouselView },
    slides: state.slides.reduce((acc, slide, idx) => {
      if (idx === 0) {
        acc.push({
          ...slide,
          position: state.carouselView.width / 2 - slide.width / 2,
        });
        return acc;
      }
      acc.push({
        ...slide,
        position: acc[idx - 1].position + acc[idx - 1].width,
      });
      return acc;
    }, []),
  };
}

function generateDOMFromState(state) {
  const carousel = document.createElement(state.carouselView.tagName);
  carousel.classList.add(...state.carouselView.classList);
  const slides = state.slides.map((slide) => {
    const element = document.createElement("div");
    element.classList.add("snap-center", "flex-shrink-0", "transition-all");
    element.style.width = `${slide.width}px`;
    element.style.height = `${slide.height}px`;
    element.style.left = `${slide.position}px`;
    return element;
  });
  carousel.append(...slides);
  return carousel;
}
