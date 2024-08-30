type Options = {
  classList?: string[];
  style?: { [key: string]: string };
};

export function Circle(size = 10, options: Options): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", `${size}`);
  svg.setAttribute("height", `${size}`);
  svg.setAttribute("role", "button");

  if (options.classList) {
    svg.classList.add(...options.classList);
  }

  if (options.style) {
    Object.apply(svg.style, options.style);
  }
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", `${size / 2}`);
  circle.setAttribute("cy", `${size / 2}`);
  circle.setAttribute("r", `${size / 2}`);

  svg.appendChild(circle);

  return svg;
}
