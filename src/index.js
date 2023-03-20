import { Carousel, InfiniteCarousel } from "./carousel";

function initCarousels() {
  document.querySelectorAll(".carousel").forEach((element) => {
    new Carousel(element).run(5000);
  });

  document.querySelectorAll(".infinite-carousel").forEach((element) => {
    new InfiniteCarousel(element).run(5000);
  });
}

initCarousels();
