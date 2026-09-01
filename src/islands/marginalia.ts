import * as THREE from "three";
import { prefersReducedMotion } from "./fonts";

/**
 * Port of the legacy GlitchMarginalia helpers: two small canvases that
 * appear at random positions in the page margins, render a dithered fog
 * through a glitch pass, and blink in and out on random lifecycles.
 */

const TEXTURE_URL = "/images/glitch_marginalia_texture.png";
const TEXTURE_SIZE = 8;
const CANVAS_COUNT = 2;
const PADDING = 52;
const MIN_VIEWPORT = 728;

const LIFECYCLES = [1000, 1500, 2000, 2500, 3000, 4000];
const DEATHCYCLES = [
  0, 500, 1000, 1500, 2000, 2500, 3000, 4000, 6000, 6500, 7000, 7500, 8000,
  9000, 9500,
];
const SIZES: readonly (readonly [number, number])[] = [
  [26, 26],
  [26, 104],
  [26, 208],
  [26, 260],
  [26, 312],
  [26, 364],
  [26, 416],
  [52, 104],
  [52, 208],
  [52, 260],
  [52, 312],
  [52, 364],
  [52, 416],
  [104, 104],
  [104, 208],
  [104, 260],
  [104, 312],
  [104, 364],
  [104, 416],
];

const VERTEX = /* glsl */ `
varying vec2 _vTexCoord;

void main() {
  _vTexCoord = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RT_FRAGMENT = /* glsl */ `
// Based heavily on https://thebookofshaders.com/13/ by Patricio Gonzalez Vivo
// and https://www.shadertoy.com/view/MslGR8 by Hornet

uniform vec2 uResolution;
uniform vec2 uSamplerResolution;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uTimeOffset;

varying vec2 _vTexCoord;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float fbm (in vec2 st, in float speed) {
    // Initial values
    float value = 0.0;
    float amplitud = .5;
    float frequency = 0.;
    float offsetTime = (uTime + uTimeOffset);

    // Loop of octaves
    for (int i = 0; i < 6; i++) {
        value += amplitud * noise(st + speed * offsetTime);
        st *= 2.;
        amplitud *= .5;
    }
    return value;
}

void combineColors( out vec4 adjustedColor, in vec4 bg, in vec4 color ) {
    float a = color.a;
    float r = (1.0 - a) * bg.r + a * color.r;
    float g = (1.0 - a) * bg.g + a * color.g;
    float b = (1.0 - a) * bg.b + a * color.b;

    adjustedColor = vec4(r, g, b, 1.0);
}

void main () {
    vec2 uv = _vTexCoord;

    const float c0 = 128.0;

    float offsetTime = (uTime + uTimeOffset);
    float ditherSpeed = 0.5;
    float fogSpeed = 0.7;
    float spread = 2.0;
    float mipLevel = 0.0;

    float its = mix(0.0, 1.0 / c0, 0.985 + (0.015 * sin(ditherSpeed * offsetTime)));
    float ofs = texture2D(uSampler, gl_FragCoord.xy / uSamplerResolution / spread, mipLevel).r;

    vec3 ditherColor;
    ditherColor = vec3(its + (ofs / 255.0));
    ditherColor.rgb = floor(ditherColor.rgb * 255.0) / 255.0;
    ditherColor.rgb *= c0;

    vec2 st = uv;
    st.x *= (uResolution.x / uResolution.y) / 2.0;
    vec3 noise = vec3(0.0);
    noise += fbm(st * 3.344, fogSpeed);

    float alphaModifier = smoothstep(0.0, 1.0, (noise.r + noise.g + noise.b) / 3.0) - 0.185;

    vec4 outColor = vec4(vec3(0.0), smoothstep(0.0, 0.65, (1.0 - min(ditherColor.r, min(ditherColor.g, ditherColor.b))) * alphaModifier));
    combineColors(gl_FragColor, vec4(1.0), outColor);
}
`;

const FRAGMENT = /* glsl */ `
// Based on https://www.shadertoy.com/view/Md2GDw by Kusma

uniform vec2 uResolution;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uTimeOffset;

varying vec2 _vTexCoord;

void rgbaFromRgb( out vec4 rgba, in vec3 rgb ) {
  float a = 1.0 - min(rgb.r, min(rgb.g, rgb.b));

  float r = 1.0 - (1.0 - rgb.r) / a;
  float g = 1.0 - (1.0 - rgb.g) / a;
  float b = 1.0 - (1.0 - rgb.b) / a;

  rgba = vec4(r, g, b, a);
}

void main () {
    vec2 uv = _vTexCoord;
    float offsetTime = (uTime + uTimeOffset);

    vec2 block = floor(gl_FragCoord.xy / vec2(64));
    vec2 uv_noise = block / vec2(64);
    uv_noise += floor(vec2(offsetTime)) / vec2(128);

    float block_thresh = pow(fract((offsetTime * 0.5) * 1236.0453), 2.0) * 1.15;

    vec2 uv_r = uv, uv_g = uv, uv_b = uv;

    if (texture2D(uSampler, uv_noise).r < block_thresh ) {
      vec2 dist = (fract(uv_noise) / uResolution.xy) * 8.25;
      uv_r += dist * 1.65;
      uv_g += dist * 1.05;
      uv_b += dist * 1.795;
    }

    vec4 outColor;
    outColor.r = texture2D(uSampler, uv_r).r;
    outColor.g = texture2D(uSampler, uv_g).g;
    outColor.b = texture2D(uSampler, uv_b).b;

    rgbaFromRgb(outColor, outColor.rgb);
    gl_FragColor = outColor;
}
`;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

const sample = <T>(list: readonly T[]): T =>
  list[randomInt(0, list.length - 1)] as T;

/** Random rectangles from the legacy size table, inside the padded container. */
class RectGenerator {
  private width = 0;
  private height = 0;

  constructor(private readonly container: HTMLElement) {
    this.measure();
  }

  measure(): void {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
  }

  randomRect(): Rect {
    const size = sample(SIZES);
    const flip = randomInt(0, 1);
    const w = size[flip] as number;
    const h = size[1 - flip] as number;
    return {
      x: randomInt(PADDING, Math.max(PADDING, this.width - PADDING - w)),
      y: randomInt(PADDING, Math.max(PADDING, this.height - PADDING - h)),
      w,
      h,
    };
  }
}

/** Two-pass Three.js shader (dithered fog → glitch) drawn on one canvas. */
class Glitch {
  readonly canvas = document.createElement("canvas");

  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0.1,
    100,
  );
  private readonly rtScene = new THREE.Scene();
  private readonly scene = new THREE.Scene();
  private readonly rtTarget: THREE.WebGLRenderTarget;
  private readonly rtMesh: THREE.Mesh;
  private readonly mesh: THREE.Mesh;
  private readonly rtUniforms: Record<string, THREE.IUniform>;
  private readonly uniforms: Record<string, THREE.IUniform>;
  private readonly rtResolution = new THREE.Vector2(1, 1);
  private readonly resolution = new THREE.Vector2(1, 1);
  private readonly timeOffset = randomInt(0, 42);

  constructor(private readonly texture: THREE.Texture) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.camera.position.z = 1;

    this.rtTarget = new THREE.WebGLRenderTarget(1, 1);

    this.rtUniforms = {
      uResolution: { value: this.rtResolution },
      uSamplerResolution: {
        value: new THREE.Vector2(TEXTURE_SIZE, TEXTURE_SIZE),
      },
      uTime: { value: 0 },
      uTimeOffset: { value: this.timeOffset },
      uSampler: { value: texture },
    };
    this.rtMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        uniforms: this.rtUniforms,
        vertexShader: VERTEX,
        fragmentShader: RT_FRAGMENT,
      }),
    );
    this.rtScene.add(this.rtMesh);

    this.uniforms = {
      uResolution: { value: this.resolution },
      uTime: { value: 0 },
      uTimeOffset: { value: this.timeOffset },
      uSampler: { value: this.rtTarget.texture },
    };
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
      }),
    );
    this.scene.add(this.mesh);
  }

  setRect(rect: Rect): void {
    this.canvas.style.left = `${rect.x}px`;
    this.canvas.style.top = `${rect.y}px`;

    this.renderer.setSize(rect.w, rect.h);
    this.rtTarget.setSize(rect.w, rect.h);

    this.camera.left = -rect.w / 2;
    this.camera.right = rect.w / 2;
    this.camera.top = rect.h / 2;
    this.camera.bottom = -rect.h / 2;
    this.camera.updateProjectionMatrix();

    this.rtMesh.scale.set(rect.w, rect.h, 1);
    this.mesh.scale.set(rect.w, rect.h, 1);

    this.rtResolution.set(rect.w, rect.h);
    this.resolution.set(rect.w, rect.h);

    // Thin strips clamp vertically so the dither does not smear.
    const wrapT =
      rect.h <= 26 ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    if (this.texture.wrapT !== wrapT) {
      this.texture.wrapT = wrapT;
      this.texture.needsUpdate = true;
    }
  }

  render(time: number): void {
    if (this.canvas.hidden) return;
    if (this.rtUniforms.uTime) this.rtUniforms.uTime.value = time;
    if (this.uniforms.uTime) this.uniforms.uTime.value = time;

    this.renderer.setRenderTarget(this.rtTarget);
    this.renderer.render(this.rtScene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

async function mount(container: HTMLElement): Promise<void> {
  if (container.dataset.mounted) return;
  container.dataset.mounted = "true";

  const texture = await new THREE.TextureLoader().loadAsync(TEXTURE_URL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.NearestMipMapNearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = true;

  const generator = new RectGenerator(container);
  const glitches: Glitch[] = [];
  const startTime = performance.now();

  const cycle = (glitch: Glitch) => {
    generator.measure();
    glitch.setRect(generator.randomRect());
    glitch.canvas.hidden = false;
    setTimeout(() => {
      glitch.canvas.hidden = true;
      setTimeout(() => cycle(glitch), sample(DEATHCYCLES));
    }, sample(LIFECYCLES));
  };

  for (let i = 0; i < CANVAS_COUNT; i++) {
    const glitch = new Glitch(texture);
    glitch.canvas.className = "marginalia";
    glitch.canvas.hidden = true;
    container.append(glitch.canvas);
    glitches.push(glitch);
    cycle(glitch);
  }

  const tick = () => {
    const time = (performance.now() - startTime) / 1000;
    for (const glitch of glitches) glitch.render(time);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const container = document.getElementById("marginalia");
const supported = (() => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
})();

if (
  container &&
  supported &&
  !prefersReducedMotion() &&
  window.innerWidth >= MIN_VIEWPORT
) {
  mount(container).catch(console.error);
}
