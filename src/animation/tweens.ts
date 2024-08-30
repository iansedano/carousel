export function tween(start, end, duration, ease = easeInOutSine) {
  const startTime = Date.now();
  const delta = end - start;

  return () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      return end;
    } else {
      const fraction = easeInOutSine(elapsed / duration);
      return delta * fraction + start;
    }
  };
}

// https://easings.net/

/**
 *
 * @param {*} x progress of animation between 0 and 1
 * @returns value between 0 and 1
 */
export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function easeOutSine(x: number): number {
  return Math.sin((x * Math.PI) / 2);
}
