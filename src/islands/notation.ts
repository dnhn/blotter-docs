/**
 * SVG port of the legacy Notation helper: a curve from a single origin
 * above each `.notated-list` to every top-level row, ending in an arrowhead.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const BASE_WIDTH = 26;
const ENTRANCE = 26;
const LINE_HEIGHT = 26;
const ARROW = 5;

function draw(container: HTMLElement): void {
  const list = container.querySelector<HTMLElement>(':scope > ul');
  if (!list) return;

  let svg = container.querySelector<SVGSVGElement>(':scope > svg.notation');
  if (!svg) {
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute(
      'class',
      'notation pointer-events-none absolute -top-lh -left-lh overflow-visible fill-none stroke-current stroke-1',
    );
    svg.setAttribute('aria-hidden', 'true');
    container.prepend(svg);
  }

  const box = container.getBoundingClientRect();
  const height = Math.ceil(box.height + ENTRANCE);
  svg.setAttribute('width', String(BASE_WIDTH));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${BASE_WIDTH} ${height}`);
  svg.replaceChildren();

  const origin = { x: BASE_WIDTH / 4, y: 0 };
  const destX = BASE_WIDTH - ARROW;

  for (const li of list.querySelectorAll<HTMLElement>(':scope > li')) {
    const rect = li.getBoundingClientRect();
    const destY = rect.top - box.top + LINE_HEIGHT / 2 + ENTRANCE;
    const length = destY - origin.y;
    const c1 = { x: origin.x * 2, y: destY - length / 4 };
    const c2 = { x: origin.x - BASE_WIDTH, y: destY - length / 12 };

    const curve = document.createElementNS(SVG_NS, 'path');
    curve.setAttribute(
      'd',
      `M${origin.x} ${origin.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${destX} ${destY}`,
    );
    svg.append(curve);

    const head = document.createElementNS(SVG_NS, 'path');
    head.setAttribute(
      'd',
      `M${destX - ARROW} ${destY - ARROW} L${destX + ARROW} ${destY} L${destX - ARROW} ${destY + ARROW}`,
    );
    svg.append(head);
  }
}

const containers = document.querySelectorAll<HTMLElement>('.notated-list');

for (const container of containers) {
  if (container.dataset.notated) continue;
  container.dataset.notated = 'true';
  new ResizeObserver(() => draw(container)).observe(container);
}

document.fonts.ready.then(() => {
  for (const container of containers) draw(container);
});
