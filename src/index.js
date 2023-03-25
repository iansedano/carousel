import { Carousel } from "./scroll-carousel/carousel";
import { InfiniteCarousel } from "./scroll-carousel/infinite-carousel";
import { SmoothCarousel } from "./scroll-carousel/smooth-carousel";
import { InfiniteSmoothCarousel } from "./scroll-carousel/infinite-smooth-carousel";
import { main as transitionCarousel } from "./scroll-carousel/transition-carousel";

function initCarousels() {
  document.querySelectorAll(".carousel").forEach((element) => {
    Carousel.fromContainer(element).run(5000);
  });
  document.querySelectorAll(".infinite-carousel").forEach((element) => {
    InfiniteCarousel.fromContainer(element).run(5000);
  });
  document.querySelectorAll(".smooth-carousel").forEach((element) => {
    SmoothCarousel.fromContainer(element).run(5000);
  });
  document.querySelectorAll(".infinite-smooth-carousel").forEach((element) => {
    InfiniteSmoothCarousel.fromContainer(element).run(5000);
  });
  document.querySelectorAll(".transition-carousel").forEach((element) => {
    transitionCarousel(element);
  });
}

initCarousels();
