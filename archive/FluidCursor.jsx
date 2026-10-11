import { useEffect, useRef } from "react";

// User-approved settings:
// Gloss: 0.00, Iridescence: 1.50, Vorticity (Curl): 5, Dissipation: 0.97, Cyan Petroleum
const CONFIG = {
  TEXTURE_DOWNSAMPLE: 1,
  DENSITY_DISSIPATION: 0.97,
  VELOCITY_DISSIPATION: 0.985,
  PRESSURE_DISSIPATION: 0.8,
  PRESSURE_ITERATIONS: 22,
  CURL: 5.0,
  SPLAT_RADIUS: 0.0034,
  GLOSS: 0.0,
  IRIDESCENCE: 1.5,
};

const CYAN_DARK = [0.384, 0.902, 0.949];
const TEAL_LIGHT = [0.03, 0.5, 0.55];

export default function FluidCursor({ dark = true }) {
  const canvasRef = useRef(null);
  const darkRef = useRef(dark);
  darkRef.current = dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    // Respect OS reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const glParams = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let gl = canvas.getContext("webgl2", glParams);
    const isWebGL2 = Boolean(gl);
    if (!isWebGL2) {
      gl = canvas.getContext("webgl", glParams) || canvas.getContext("experimental-webgl", glParams);
    }
    if (!gl) return undefined;

    const halfFloat = gl.getExtension("OES_texture_half_float");
    let supportLinearFloat = gl.getExtension("OES_texture_half_float_linear");
    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      supportLinearFloat = gl.getExtension("OES_texture_float_linear");
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const ext = {
      internalFormat: isWebGL2 ? gl.RGBA16F : gl.RGBA,
      internalFormatRG: isWebGL2 ? gl.RG16F : gl.RGBA,
      formatRG: isWebGL2 ? gl.RG : gl.RGBA,
      texType: isWebGL2 ? gl.HALF_FLOAT : halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE,
    };
    const hasLinear = Boolean(supportLinearFloat);

    class GLProgram {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          const uniformName = gl.getActiveUniform(this.program, i).name;
          this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
        }
      }
      bind() {
        gl.useProgram(this.program);
      }
      dispose() {
        gl.deleteProgram(this.program);
      }
    }

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `precision highp float;
       attribute vec2 aPosition;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform vec2 texelSize;
       void main () {
         vUv = aPosition * 0.5 + 0.5;
         vL = vUv - vec2(texelSize.x, 0.0);
         vR = vUv + vec2(texelSize.x, 0.0);
         vT = vUv + vec2(0.0, texelSize.y);
         vB = vUv - vec2(0.0, texelSize.y);
         gl_Position = vec4(aPosition, 0.0, 1.0);
       }`,
    );

    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       uniform sampler2D uTexture;
       uniform float value;
       void main () {
         gl_FragColor = value * texture2D(uTexture, vUv);
       }`,
    );

    const displayShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       precision mediump sampler2D;
       varying vec2 vUv;
       uniform sampler2D uTexture;
       uniform vec2 texelSize;
       uniform float uGloss;
       uniform float uIridescence;

       void main () {
         vec4 c = texture2D(uTexture, vUv);
         float d = max(c.r, max(c.g, c.b));

         if (d < 0.002) {
           gl_FragColor = vec4(0.0);
           return;
         }

         vec2 offset = texelSize * 2.5;
         float l = max(texture2D(uTexture, vUv - vec2(offset.x, 0.0)).r, max(texture2D(uTexture, vUv - vec2(offset.x, 0.0)).g, texture2D(uTexture, vUv - vec2(offset.x, 0.0)).b));
         float r = max(texture2D(uTexture, vUv + vec2(offset.x, 0.0)).r, max(texture2D(uTexture, vUv + vec2(offset.x, 0.0)).g, texture2D(uTexture, vUv + vec2(offset.x, 0.0)).b));
         float b = max(texture2D(uTexture, vUv - vec2(0.0, offset.y)).r, max(texture2D(uTexture, vUv - vec2(0.0, offset.y)).g, texture2D(uTexture, vUv - vec2(0.0, offset.y)).b));
         float t = max(texture2D(uTexture, vUv + vec2(0.0, offset.y)).r, max(texture2D(uTexture, vUv + vec2(0.0, offset.y)).g, texture2D(uTexture, vUv + vec2(0.0, offset.y)).b));

         vec3 normal = normalize(vec3((l - r) * 4.2, (b - t) * 4.2, 0.28));
         vec3 lightDir = normalize(vec3(0.42, 0.78, 0.88));
         vec3 viewDir = vec3(0.0, 0.0, 1.0);
         vec3 halfDir = normalize(lightDir + viewDir);

         float NdotH = max(dot(normal, halfDir), 0.0);
         float spec = pow(NdotH, 28.0) * uGloss * 1.85;
         float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.4);

         float phase = d * 4.8 + fresnel * 2.2;
         vec3 iridescentShift = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.05, 0.35, 0.65)));

         vec3 oilColor = mix(c.rgb, c.rgb * 0.65 + iridescentShift * 0.65, clamp(uIridescence * 0.85, 0.0, 1.0));
         vec3 specColor = mix(vec3(1.0), iridescentShift, 0.35) * spec;
         vec3 finalRgb = oilColor + specColor + fresnel * c.rgb * 0.5 * uGloss;

         float alpha = smoothstep(0.005, 0.16, d) * clamp(d * 1.5, 0.0, 1.0);
         gl_FragColor = vec4(finalRgb, alpha);
       }`,
    );

    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       uniform sampler2D uTarget;
       uniform float aspectRatio;
       uniform vec3 color;
       uniform vec2 point;
       uniform float radius;
       void main () {
         vec2 p = vUv - point.xy;
         p.x *= aspectRatio;
         vec3 splat = exp(-dot(p, p) / radius) * color;
         vec3 base = texture2D(uTarget, vUv).xyz;
         gl_FragColor = vec4(base + splat, 1.0);
       }`,
    );

    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       uniform sampler2D uVelocity;
       uniform sampler2D uSource;
       uniform vec2 texelSize;
       uniform float dt;
       uniform float dissipation;
       void main () {
         vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
         gl_FragColor = dissipation * texture2D(uSource, coord);
       }`,
    );

    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uVelocity;
       vec2 sampleVelocity (in vec2 uv) {
         vec2 multiplier = vec2(1.0, 1.0);
         if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
         if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
         if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
         if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
         return multiplier * texture2D(uVelocity, uv).xy;
       }
       void main () {
         float L = sampleVelocity(vL).x;
         float R = sampleVelocity(vR).x;
         float T = sampleVelocity(vT).y;
         float B = sampleVelocity(vB).y;
         float div = 0.5 * (R - L + T - B);
         gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
       }`,
    );

    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uVelocity;
       void main () {
         float L = texture2D(uVelocity, vL).y;
         float R = texture2D(uVelocity, vR).y;
         float T = texture2D(uVelocity, vT).x;
         float B = texture2D(uVelocity, vB).x;
         float vorticity = R - L - T + B;
         gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
       }`,
    );

    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uVelocity;
       uniform sampler2D uCurl;
       uniform float curl;
       uniform float dt;
       void main () {
         float L = texture2D(uCurl, vL).y;
         float R = texture2D(uCurl, vR).y;
         float T = texture2D(uCurl, vT).x;
         float B = texture2D(uCurl, vB).x;
         float C = texture2D(uCurl, vUv).x;
         vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
         force *= 1.0 / length(force + 0.00001) * curl * C;
         vec2 vel = texture2D(uVelocity, vUv).xy;
         gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
       }`,
    );

    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uPressure;
       uniform sampler2D uDivergence;
       vec2 boundary (in vec2 uv) {
         return min(max(uv, 0.0), 1.0);
       }
       void main () {
         float L = texture2D(uPressure, boundary(vL)).x;
         float R = texture2D(uPressure, boundary(vR)).x;
         float T = texture2D(uPressure, boundary(vT)).x;
         float B = texture2D(uPressure, boundary(vB)).x;
         float divergence = texture2D(uDivergence, vUv).x;
         float pressure = (L + R + B + T - divergence) * 0.25;
         gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
       }`,
    );

    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `precision highp float;
       varying vec2 vUv;
       varying vec2 vL;
       varying vec2 vR;
       varying vec2 vT;
       varying vec2 vB;
       uniform sampler2D uPressure;
       uniform sampler2D uVelocity;
       vec2 boundary (in vec2 uv) {
         return min(max(uv, 0.0), 1.0);
       }
       void main () {
         float L = texture2D(uPressure, boundary(vL)).x;
         float R = texture2D(uPressure, boundary(vR)).x;
         float T = texture2D(uPressure, boundary(vT)).x;
         float B = texture2D(uPressure, boundary(vB)).x;
         vec2 velocity = texture2D(uVelocity, vUv).xy;
         velocity.xy -= vec2(R - L, T - B);
         gl_FragColor = vec4(velocity, 0.0, 1.0);
       }`,
    );

    let textureWidth = 0;
    let textureHeight = 0;
    let density, velocity, divergence, curl, pressure;

    const clearProgram = new GLProgram(baseVertexShader, clearShader);
    const displayProgram = new GLProgram(baseVertexShader, displayShader);
    const splatProgram = new GLProgram(baseVertexShader, splatShader);
    const advectionProgram = new GLProgram(baseVertexShader, advectionShader);
    const divergenceProgram = new GLProgram(baseVertexShader, divergenceShader);
    const curlProgram = new GLProgram(baseVertexShader, curlShader);
    const vorticityProgram = new GLProgram(baseVertexShader, vorticityShader);
    const pressureProgram = new GLProgram(baseVertexShader, pressureShader);
    const gradientSubtractProgram = new GLProgram(baseVertexShader, gradientSubtractShader);

    function createFBO(texId, w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0 + texId);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return [texture, fbo, texId];
    }

    function createDoubleFBO(texId, w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(texId, w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param);
      return {
        get first() {
          return fbo1;
        },
        get second() {
          return fbo2;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    function initFramebuffers() {
      textureWidth = gl.drawingBufferWidth >> CONFIG.TEXTURE_DOWNSAMPLE;
      textureHeight = gl.drawingBufferHeight >> CONFIG.TEXTURE_DOWNSAMPLE;

      const iFormat = ext.internalFormat;
      const iFormatRG = ext.internalFormatRG;
      const formatRG = ext.formatRG;
      const texType = ext.texType;

      density = createDoubleFBO(0, textureWidth, textureHeight, iFormat, gl.RGBA, texType, hasLinear ? gl.LINEAR : gl.NEAREST);
      velocity = createDoubleFBO(2, textureWidth, textureHeight, iFormatRG, formatRG, texType, hasLinear ? gl.LINEAR : gl.NEAREST);
      divergence = createFBO(4, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);
      curl = createFBO(5, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);
      pressure = createDoubleFBO(6, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const blit = (destination) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    function splat(x, y, dx, dy, color) {
      if (!velocity || !density) return;
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.first[2]);
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
      gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0);
      gl.uniform1f(splatProgram.uniforms.radius, CONFIG.SPLAT_RADIUS);
      blit(velocity.second[1]);
      velocity.swap();

      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, density.first[2]);
      gl.uniform3f(splatProgram.uniforms.color, color[0] * 0.52, color[1] * 0.52, color[2] * 0.52);
      blit(density.second[1]);
      density.swap();
    }

    function resizeCanvas() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height || !velocity || !density) {
        canvas.width = width;
        canvas.height = height;
        initFramebuffers();
      }
    }

    const pointer = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      moved: false,
    };
    let pointerInitialized = false;

    const onPointerMove = (e) => {
      if (!pointerInitialized) {
        pointerInitialized = true;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        return;
      }
      pointer.moved = true;
      pointer.dx = (e.clientX - pointer.x) * 8.0;
      pointer.dy = (e.clientY - pointer.y) * 8.0;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };

    const onPointerDown = (e) => {
      const color = darkRef.current ? CYAN_DARK : TEAL_LIGHT;
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 180 + Math.random() * 220;
        splat(e.clientX, e.clientY, Math.cos(angle) * speed, Math.sin(angle) * speed, color);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", resizeCanvas);

    let animId = 0;
    let lastTime = performance.now();

    function updateSimulation() {
      resizeCanvas();
      if (!velocity || !density) {
        animId = requestAnimationFrame(updateSimulation);
        return;
      }

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      gl.viewport(0, 0, textureWidth, textureHeight);

      if (pointer.moved) {
        const color = darkRef.current ? CYAN_DARK : TEAL_LIGHT;
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, color);
        pointer.moved = false;
      }

      // Advection
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.first[2]);
      gl.uniform1i(advectionProgram.uniforms.uSource, velocity.first[2]);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, CONFIG.VELOCITY_DISSIPATION);
      blit(velocity.second[1]);
      velocity.swap();

      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.first[2]);
      gl.uniform1i(advectionProgram.uniforms.uSource, density.first[2]);
      gl.uniform1f(advectionProgram.uniforms.dissipation, CONFIG.DENSITY_DISSIPATION);
      blit(density.second[1]);
      density.swap();

      // Curl & Vorticity
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.first[2]);
      blit(curl[1]);

      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.first[2]);
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl[2]);
      gl.uniform1f(vorticityProgram.uniforms.curl, CONFIG.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.second[1]);
      velocity.swap();

      // Divergence
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.first[2]);
      blit(divergence[1]);

      // Pressure Poisson Solve
      clearProgram.bind();
      let pressureTexId = pressure.first[2];
      gl.activeTexture(gl.TEXTURE0 + pressureTexId);
      gl.bindTexture(gl.TEXTURE_2D, pressure.first[0]);
      gl.uniform1i(clearProgram.uniforms.uTexture, pressureTexId);
      gl.uniform1f(clearProgram.uniforms.value, CONFIG.PRESSURE_DISSIPATION);
      blit(pressure.second[1]);
      pressure.swap();

      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence[2]);
      pressureTexId = pressure.first[2];
      gl.activeTexture(gl.TEXTURE0 + pressureTexId);

      for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
        gl.bindTexture(gl.TEXTURE_2D, pressure.first[0]);
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressureTexId);
        blit(pressure.second[1]);
        pressure.swap();
      }

      // Gradient Subtraction
      gradientSubtractProgram.bind();
      gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.first[2]);
      gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.first[2]);
      blit(velocity.second[1]);
      velocity.swap();

      // Screen Blit with Specular Oily Shader
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      displayProgram.bind();
      gl.uniform1i(displayProgram.uniforms.uTexture, density.first[2]);
      gl.uniform2f(displayProgram.uniforms.texelSize, 1.0 / canvas.width, 1.0 / canvas.height);
      gl.uniform1f(displayProgram.uniforms.uGloss, CONFIG.GLOSS);
      gl.uniform1f(displayProgram.uniforms.uIridescence, CONFIG.IRIDESCENCE);
      blit(null);

      animId = requestAnimationFrame(updateSimulation);
    }

    // Initialize dimensions and framebuffers immediately
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFramebuffers();
    animId = requestAnimationFrame(updateSimulation);

    // Initial ambient fluid puff so effect is visible on mount
    const startTimer = setTimeout(() => {
      const cx = window.innerWidth * 0.45;
      const cy = window.innerHeight * 0.38;
      const color = darkRef.current ? CYAN_DARK : TEAL_LIGHT;
      splat(cx, cy, 140, -180, color);
      splat(cx + 30, cy + 20, -120, 160, color);
    }, 250);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", resizeCanvas);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(indexBuffer);
      clearProgram.dispose();
      displayProgram.dispose();
      splatProgram.dispose();
      advectionProgram.dispose();
      divergenceProgram.dispose();
      curlProgram.dispose();
      vorticityProgram.dispose();
      pressureProgram.dispose();
      gradientSubtractProgram.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-screen w-screen"
      style={{
        mixBlendMode: dark ? "screen" : "multiply",
      }}
    />
  );
}
