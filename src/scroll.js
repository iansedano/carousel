import { tween, easeInOutSine } from "./tweens";

export function scrollWindow(element, target, duration, ease = easeInOutSine) {
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
