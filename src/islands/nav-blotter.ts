import {
  Blotter,
  isWebGLSupported,
  type RenderScope,
  ShaderMaterial,
  Text,
} from 'blotter.ts';
import { renderOnce } from './demo';
import {
  cssFamily,
  FACE,
  prefersReducedMotion,
  WEIGHT,
  waitForFonts,
} from './fonts';
import { onThemeChange, readColor, toVec3 } from './theme';

/**
 * Renders the masthead wordmark through Blotter (legacy `Views.Navigation`
 * logo). Real text stays in the DOM for assistive tech and is only visually
 * hidden once the canvas is ready.
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

    // Coverage from the darkest sample; colour from the theme.
    mainImage = vec4(uInk, a);
}
`;

const inkUniform = () => ({
  uInk: { type: '3f' as const, value: toVec3(readColor('--ink')) },
});

/** Point a nav shader at the current ink; redraw if the loop is stopped. */
function followTheme(blotter: Blotter): void {
  onThemeChange(() => {
    const ink = blotter.material.uniforms.uInk;
    if (ink) ink.value = toVec3(readColor('--ink'));
    renderOnce(blotter);
  });
}

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
  scope.appendTo(anchor);
}

async function mountLogo(label: HTMLElement): Promise<void> {
  const anchor = label.closest<HTMLElement>('a');
  if (!anchor) return;

  const family = cssFamily(FACE.display);
  await waitForFonts([`${WEIGHT.display} 48px ${family}`], 'blotter');

  const text = new Text('blotter', {
    family,
    size: 48,
    weight: WEIGHT.display,
    leading: '52px',
    paddingTop: 14,
    paddingLeft: 14,
    paddingRight: 14,
    fill: '#000',
  });
  const blotter = new Blotter(
    new ShaderMaterial(LOGO_MAIN_IMAGE, { uniforms: inkUniform() }),
    { texts: text },
  );
  followTheme(blotter);
  const scope = blotter.forText(text);
  if (!scope) return;

  await blotter.ready;
  showCanvas(anchor, label, scope);
  stopAfterFirstFrame(blotter);
}

const logo = document.querySelector<HTMLElement>('[data-logo-blotter]');

if (isWebGLSupported() && logo && !logo.dataset.mounted) {
  logo.dataset.mounted = 'true';
  mountLogo(logo).catch(console.error);
}
