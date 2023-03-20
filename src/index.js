import { Carousel } from "./carousel";
import { InfiniteCarousel } from "./infinite-carousel";
import { SmoothCarousel } from "./smooth-carousel";

function initCarousels() {
  document.querySelectorAll(".carousel").forEach((element) => {
    new Carousel(element).run(5000);
  });

  document.querySelectorAll(".infinite-carousel").forEach((element) => {
    new InfiniteCarousel(element).run(5000);
  });

  document.querySelectorAll(".smooth-carousel").forEach((element) => {
    new SmoothCarousel(element).run(5000);
  });
}

initCarousels();
