type Dims = {
  width: number;
  height: number;
};

type Position = {
  width: number;
  position: number;
};

export class CarouselState {
  carouselDims: Dims;
  slides: Position[];
  idx: number;

  constructor(carouselDims: Dims, slides: Position[], idx: number) {
    this.carouselDims = carouselDims;
    this.slides = slides;
    this.idx = idx;
  }

  initializeState() {
    return new CarouselState(
      { ...this.carouselDims },
      this.slides.reduce((acc: Position[], slide, idx) => {
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

type PlatformCarouselStateType = {
  view: Dims;
  platform: Position;
  slides: Position[];
  idx: number;
};

export type Alignment = "center" | "left" | "right";

type Options = {
  align?: Alignment;
};

export class PlatformCarouselState {
  view: Dims;
  platform: Position;
  slides: Position[];
  idx: number;
  options: Options;

  constructor(
    { view, platform, slides, idx }: PlatformCarouselStateType,
    options: Options = {}
  ) {
    this.view = view;
    this.platform = platform;
    this.slides = slides;
    this.idx = idx;
    this.options = options;
  }

  tickState() {
    if (this.idx == this.slides.length - 1) {
      return this.setState(0);
    }

    return this.setState(this.idx + 1);
  }

  setState(targetIdx: number) {
    let targetPositionForSlide: number;

    if (this.options.align === "left") {
      targetPositionForSlide = 0;
    } else {
      targetPositionForSlide =
        this.view.width / 2 - this.slides[targetIdx].width / 2;
    }

    const slidePositionInPlatform = this.slides[targetIdx].position;

    const targetPosition = targetPositionForSlide - slidePositionInPlatform;

    return new PlatformCarouselState(
      {
        view: { ...this.view },
        platform: {
          width: this.platform.width,
          position: targetPosition,
        },
        slides: [...this.slides],
        idx: targetIdx,
      },
      { ...this.options }
    );
  }
}
