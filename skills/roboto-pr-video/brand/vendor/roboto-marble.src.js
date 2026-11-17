// Roboto marble ground: the "Warp" fragment shader from Paper Shaders (Apache-2.0,
// github.com/paper-design/shaders) on a minimal WebGL2 mount with NO clock of its own:
// seek(seconds) draws one frame, so every frame is a pure function of film time
// (frame-exact renders, seek-safe previews). Rebuild: esbuild roboto-marble.src.js --bundle
// --format=iife --global-name=RobotoMarble --minify (with @paper-design/shaders installed).
import { vertexShaderSource } from "./package/dist/vertex-shader.js";
import { warpFragmentShader, WarpPatterns } from "./package/dist/shaders/warp.js";
import { getShaderColorFromString as color } from "./package/dist/get-shader-color-from-string.js";
import { getShaderNoiseTexture } from "./package/dist/get-shader-noise-texture.js";

export const THEMES = {
  // black with silver smoke (TL;DR reference)
  dark: { colors: ["#000000", "#000000", "#8f8f8f", "#000000", "#000000", "#000000", "#7a7a7a", "#000000"], proportion: 0.5, softness: 0.85,
          distortion: 0.25, swirl: 0.8, swirlIterations: 10, shapeScale: 0.1, scale: 1 },
  // white with soft grey bands (F5 Aisle reference)
  light: { colors: ["#ffffff", "#f4f4f5", "#c8c8cc", "#9a9aa0"], proportion: 0.42, softness: 1,
           distortion: 0.3, swirl: 0.9, swirlIterations: 10, shapeScale: 0.1, scale: 1 },
};
export const SPEED = 0.8;   // shader seconds per film second (the references' pace)
export const START = 2;     // shader time at film t = 0

export function mount(el, theme = "dark") {
  const p = THEMES[theme] || THEMES.dark;
  const canvas = document.createElement("canvas");
  canvas.width = el.clientWidth; canvas.height = el.clientHeight;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  el.appendChild(canvas);
  const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false });
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, warpFragmentShader));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const f = { u_pixelRatio: 1, u_fit: 2, u_scale: p.scale, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5,
    u_worldWidth: 0, u_worldHeight: 0, u_imageAspectRatio: 1, u_colorsCount: p.colors.length, u_proportion: p.proportion,
    u_softness: p.softness, u_shape: WarpPatterns.edge, u_shapeScale: p.shapeScale, u_distortion: p.distortion, u_swirl: p.swirl,
    u_swirlIterations: p.swirlIterations };
  for (const k in f) gl.uniform1f(U(k), f[k]);
  gl.uniform2f(U("u_resolution"), canvas.width, canvas.height);
  gl.uniform4fv(U("u_colors"), new Float32Array(p.colors.flatMap((c) => color(c))));
  gl.viewport(0, 0, canvas.width, canvas.height);

  let ready = false, t = 0;
  const draw = () => { if (!ready) return; gl.uniform1f(U("u_time"), START + t * SPEED); gl.drawArrays(gl.TRIANGLES, 0, 6); };
  const noise = getShaderNoiseTexture();
  const start = () => {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noise);
    gl.uniform1i(U("u_noiseTexture"), 0);
    ready = true; draw();
  };
  if (noise.complete && noise.naturalWidth > 0) start(); else noise.addEventListener("load", start);
  return { seek: (sec) => { t = sec; draw(); } };
}
