import { Carousel, InfiniteCarousel } from "./carousel";

function button() {
  const classList =
    "rounded-full text-transparent bg-white outline-black outline-[1px] outline w-6 inline-block";
}

function initCarousels() {
  document.querySelectorAll(".carousel").forEach((element) => {
    new Carousel(element).run(1000);
  });

  document.querySelectorAll(".infinite-carousel").forEach((element) => {
    new InfiniteCarousel(element).run(1000);
  });
}

initCarousels();
