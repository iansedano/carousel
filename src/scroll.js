import { tween, easeInOutSine } from "./tweens";

/**
 *
 * NOTE - smooth scroll and snapping need to be off
 *
 * @param {*} element DOM element with overflow that needs to be scrolled
 * @param {*} target target x coordinate
 * @param {*} duration how long the animation should take in seconds
 * @param {*} ease easing function
 */
export function scrollWindowX(element, target, duration, ease = easeInOutSine) {
  const scrollTween = tween(element.scrollLeft, target, duration, ease);

  const update = () => {
    const step = scrollTween();
    element.scrollLeft = step;
    if (step == target) {
      return;
    } else {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
}
