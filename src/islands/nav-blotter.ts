import {
  Blotter,
  isWebGLSupported,
  type RenderScope,
  ShaderMaterial,
  Text,
} from 'blotter.ts';
import { cssFamily, prefersReducedMotion, waitForFonts } from './fonts';

/**
 * Renders the masthead logo and nav labels through Blotter (legacy
 * `Views.Navigation`). Real text stays in the DOM for assistive tech and
 * is only visually hidden once a canvas is ready.
 */

const LOGO_MAIN_IMAGE = /* glsl */ `
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void mainImage( out vec4 mainImage, in vec2 fragCoord )
{
    // Setup ========================================================================
    vec2 uv = fragCoord.xy / uResolution.xy;
    float time = uGlobalTime / 4.0;

    vec4 finalColour = vec4(0.0);

    // Create Heat Points ===========================================================
    float heatDistanceScale = 35.0; // Larger value equates to smaller spread

    // Define 2 heat points
    float heatPoint1X = 0.5 - (sin(time) / 2.0);
    float heatPoint1Y = 0.5 - ((cos(time) * abs(cos(time))) / 1.5);
    vec2 heatPoint1Uv = vec2(heatPoint1X, heatPoint1Y) * uResolution.xy;

    float heatPoint2X = 0.5 - (sin(time - 1.0) / 2.0);
    float heatPoint2Y = 0.5 - ((cos(time - 1.0) * abs(cos(time))) / 1.0);
    vec2 heatPoint2Uv = vec2(heatPoint2X, heatPoint2Y) * uResolution.xy;

    // Calculate distances from current UV and combine
    float heatPoint1Dist = smoothstep(0.0, 1.4, distance(fragCoord, heatPoint1Uv) / uResolution.y);
    float heatPoint2Dist = smoothstep(0.0, 1.25, distance(fragCoord, heatPoint2Uv) / uResolution.y);
    float combinedDist = (heatPoint1Dist * heatPoint2Dist);

    // Invert and scale
    float amount = 1.0 - smoothstep(0.15, 25.0, combinedDist * heatDistanceScale);
    amount = smoothstep(-1.0, 1.0, amount);

    // Create Darkness ==============================================================
    const int darknessRadius = 10;

    vec2 stepCoord = vec2(0.0);
    vec2 stepUV = vec2(0.0);

    vec4 stepSample = vec4(1.0);
    vec4 darkestSample = vec4(1.0);

    float stepDistance = 1.0;

    vec2 maxDistanceCoord = fragCoord.xy + vec2(float(darknessRadius), 0.0);
    vec2 maxDistanceUV = maxDistanceCoord.xy / uResolution.xy;
    float maxDistance = distance(fragCoord, maxDistanceCoord);

    float randNoise = rand(uv * sin(time * 0.025)) * 0.15;

    // Find the darkest sample and some relevant meta data within a radius.
    for (int i = -darknessRadius; i <= darknessRadius; i += 1) {
        for (int j = -darknessRadius; j <= darknessRadius; j += 1) {
            stepCoord = fragCoord + vec2(float(i), float(j));
            stepUV = stepCoord / uResolution.xy;
            stepSample = textTexture(stepUV);
            vec4 sampleOnWhite = normalBlend(stepSample, vec4(1.0));
            stepDistance = distance(fragCoord, stepCoord) / smoothstep(-1.0, 1.0, amount);

            float stepDarkestSampleWeight = 1.0 - clamp((stepDistance / maxDistance), 0.0, 1.0) + randNoise;
            stepDarkestSampleWeight *= smoothstep(0.0, 7.5, amount);

            vec4 mixedStep = mix(darkestSample, sampleOnWhite, stepDarkestSampleWeight);

            if (mixedStep == min(mixedStep, darkestSample) && stepDistance <= maxDistance) {
                darkestSample = mixedStep;
            }
        }
    }

    float a = 1.0 - min(darkestSample.r, min(darkestSample.g, darkestSample.b));

    float r = 1.0 - (1.0 - darkestSample.r) / a;
    float g = 1.0 - (1.0 - darkestSample.g) / a;
    float b = 1.0 - (1.0 - darkestSample.b) / a;
    vec3 outRGB = vec3(r, g, b);

    mainImage = vec4(outRGB, a);
}
`;

const NAV_MAIN_IMAGE = /* glsl */ `
float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

void mainImage(out vec4 mainImage, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / uResolution.xy;
    vec2 p = vec2(1.0) / uResolution.xy;

    float stepDistance = 6.5 * p.y;

    vec2 thresholdCenter = vec2(0.5);
    float slope = 0.1;
    float threshold = (slope * (uv.x - thresholdCenter.x)) + (thresholdCenter.y);

    uv.x += (stepDistance * when_gt(uv.y, threshold) * hovering); // Shift right
    uv.x -= (stepDistance * when_lt(uv.y, threshold) * hovering); // Shift left

    mainImage = textTexture(uv);
}
`;

function stopAfterFirstFrame(blotter: Blotter): void {
  if (!prefersReducedMotion()) return;
  const off = blotter.on('render', () => {
    off();
    blotter.stop();
  });
}

function showCanvas(
  anchor: HTMLElement,
  label: HTMLElement,
  scope: RenderScope,
): void {
  scope.domElement.setAttribute('aria-hidden', 'true');
  label.classList.add('sr-only');
  anchor.dataset.state = 'canvas';
  scope.appendTo(anchor);
}

async function mountLogo(label: HTMLElement): Promise<void> {
  const anchor = label.closest<HTMLElement>('a');
  if (!anchor) return;

  const family = cssFamily('--font-fraunces');
  await waitForFonts([`400 48px ${family}`], 'blotter');

  const text = new Text('blotter', {
    family,
    size: 48,
    weight: 400,
    leading: '52px',
    paddingTop: 14,
    paddingLeft: 14,
    paddingRight: 14,
    fill: '#202020',
  });
  const blotter = new Blotter(new ShaderMaterial(LOGO_MAIN_IMAGE), {
    texts: text,
  });
  const scope = blotter.forText(text);
  if (!scope) return;

  await blotter.ready;
  showCanvas(anchor, label, scope);
  stopAfterFirstFrame(blotter);
}

async function mountNav(labels: HTMLElement[]): Promise<void> {
  const family = cssFamily('--font-figtree');
  await waitForFonts([`400 14px ${family}`], 'DOCUMENTATION');

  const texts = labels.map(
    (label) =>
      new Text(label.dataset.navBlotter ?? label.textContent ?? '', {
        family,
        size: 14,
        weight: 400,
        leading: '50px',
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 2,
        fill: '#202020',
      }),
  );
  const material = new ShaderMaterial(NAV_MAIN_IMAGE, {
    uniforms: { hovering: { type: '1f', value: 0 } },
  });
  const blotter = new Blotter(material, { texts });
  await blotter.ready;

  labels.forEach((label, i) => {
    const anchor = label.closest<HTMLElement>('a');
    const text = texts[i];
    const scope = text ? blotter.forText(text) : undefined;
    if (!anchor || !scope) return;

    showCanvas(anchor, label, scope);

    const active = anchor.getAttribute('aria-current') === 'page';
    const setHover = (on: boolean) => {
      const hovering = scope.material.uniforms.hovering;
      if (hovering) hovering.value = on || active ? 1 : 0;
    };
    setHover(false);
    anchor.addEventListener('mouseenter', () => setHover(true));
    anchor.addEventListener('mouseleave', () => setHover(false));
    anchor.addEventListener('focus', () => setHover(true));
    anchor.addEventListener('blur', () => setHover(false));
  });

  stopAfterFirstFrame(blotter);
}

const logo = document.querySelector<HTMLElement>('[data-logo-blotter]');
const navLabels = [
  ...document.querySelectorAll<HTMLElement>('[data-nav-blotter]'),
];

if (isWebGLSupported()) {
  if (logo && !logo.dataset.mounted) {
    logo.dataset.mounted = 'true';
    mountLogo(logo).catch(console.error);
  }
  const pending = navLabels.filter((label) => !label.dataset.mounted);
  for (const label of pending) label.dataset.mounted = 'true';
  if (pending.length) mountNav(pending).catch(console.error);
}
