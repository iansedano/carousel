import { Carousel } from "./carousel";
import { InfiniteCarousel } from "./infinite-carousel";
import { SmoothCarousel } from "./smooth-carousel";

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
}

initCarousels();
