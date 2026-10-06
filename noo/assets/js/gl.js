// Noo — hero WebGL : deux « parties » (metaballs) qui fusionnent.
// L'intersection des deux cercles — l'accord — s'allume en argile.
// Expose window.NooGL = { setMerge(0..1) } ; sans WebGL, le CSS affiche deux cercles.
(() => {
  const canvas = document.querySelector('[data-gl]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { document.documentElement.classList.add('no-gl'); return; }

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const frag = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uMerge, uIntro;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  float t = uTime;
  float asp = uRes.x / uRes.y;
  float s = clamp(asp * .62, .55, 1.);              // échelle (portrait = plus petit)
  float m = smoothstep(0., 1., uMerge);

  float spread = mix(.255, .0, m) * s * mix(2.2, 1., uIntro);
  vec2 c1 = vec2(-spread, .03 * s) + .02 * vec2(sin(t * .7), cos(t * .9));
  vec2 c2 = vec2( spread, -.03 * s) + .02 * vec2(cos(t * .6), sin(t * .8));
  float r = (.29 + .06 * m) * s * uIntro;

  // cercles en distance signée + union douce (pont « liquide » au contact)
  float d1 = length(uv - c1) - r;
  float d2 = length(uv - c2) - r;
  float dm = length(uv - uMouse) - .045 * s * uIntro;
  float k = .07 * s;
  float h = clamp(.5 + .5 * (d2 - d1) / k, 0., 1.);
  float u = mix(d2, d1, h) - k * h * (1. - h);
  float k2 = .12 * s;
  float h2 = clamp(.5 + .5 * (dm - u) / k2, 0., 1.);
  u = mix(dm, u, h2) - k2 * h2 * (1. - h2);
  float lensD = max(d1, d2);

  float px = 1.5 / uRes.y;
  float inside = smoothstep(px, -px, u);
  float lens = smoothstep(px, -px, lensD);

  vec3 bg = vec3(.071, .067, .063);
  vec3 forest = vec3(.105, .184, .160);
  vec3 forestHi = vec3(.36, .51, .45);
  vec3 mist = vec3(.80, .85, .78);
  float g = clamp(.55 + uv.y * 1.2 - uv.x * .3 + .06 * sin(t * .5 + uv.x * 5.), 0., 1.);
  vec3 base = mix(forest, forestHi, g);
  float depth = clamp(-u / (r * .9), 0., 1.);
  base = mix(base * 1.25, base * .78, depth);                 // bord éclairé, cœur plus profond
  base += mist * .22 * (1. - smoothstep(0., .035, -u)) * g;   // liseré lumineux

  vec3 clay = vec3(.84, .35, .19);
  vec3 peach = vec3(.97, .68, .50);
  float ld = clamp(-lensD / (r * .8), 0., 1.);
  vec3 lensCol = mix(clay, peach, clamp(.4 + uv.y * 1.4 + .12 * sin(t * .8 + uv.x * 3.), 0., 1.));
  lensCol = mix(lensCol * 1.08, lensCol * .9, ld);

  float halo = exp(-max(u, 0.) * 9.) * (1. - inside);
  vec3 col = bg + halo * vec3(.06, .10, .085);
  col = mix(col, base, inside);
  col = mix(col, lensCol, lens);

  // les deux cercles d'origine, au trait fin
  float ring = (1. - smoothstep(0., px * 1.2, abs(d1))) + (1. - smoothstep(0., px * 1.2, abs(d2)));
  col = mix(col, vec3(.96, .94, .9), clamp(ring, 0., 1.) * .38 * uIntro);

  col += (hash(gl_FragCoord.xy + fract(t * 7.) * 91.) - .5) * .055;
  gl_FragColor = vec4(col, 1.);
}`;

  const sh = (type, src) => {
    const o = gl.createShader(type);
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
    return o;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);
  } catch (e) {
    console.warn(e);
    document.documentElement.classList.add('no-gl');
    return;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uMerge', 'uIntro', 'uMouse'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  const state = { merge: 0, intro: 0, introStart: 0, mx: 0.6, my: -0.3, tx: 0.6, ty: -0.3 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  addEventListener('resize', resize);
  resize();

  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY > r.bottom) return;
    state.tx = (e.clientX - r.left - r.width / 2) / r.height;
    state.ty = (r.height / 2 - (e.clientY - r.top)) / r.height;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; }).observe(canvas);

  const t0 = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    state.mx += (state.tx - state.mx) * 0.06;
    state.my += (state.ty - state.my) * 0.06;
    if (state.introStart) { const p = Math.min(1, (now - state.introStart) / 2400); state.intro = 1 - Math.pow(1 - p, 3); }
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1f(U.uMerge, state.merge);
    gl.uniform1f(U.uIntro, state.intro);
    gl.uniform2f(U.uMouse, state.mx, state.my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);

  window.NooGL = {
    setMerge: (v) => { state.merge = Number.isFinite(v) ? v : 0; },
    show: () => { if (!state.introStart) state.introStart = performance.now(); },
  };
  canvas.classList.add('is-on');
})();
