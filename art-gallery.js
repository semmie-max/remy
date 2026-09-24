/* =========================================================
   Art Gallery — vanilla three.js port of ObsidianUI's
   "art-gallery" registry block, adapted to show song
   artwork + title/artist instead of gallery images/year.

   Requires three.js to be loaded as a global THREE before
   this file runs (see the <script> order in the HTML).
   ========================================================= */
(function () {
  const CONFIG = {
    cellSize: 0.75,
    zoomLevel: 1.25,
    lerpFactor: 0.075,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(0, 0, 0, 1)",
    textColor: "rgba(255, 255, 255, 0.55)",
    hoverColor: "rgba(255, 255, 255, 0)",
  };

  const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    uniform vec2 uOffset;
    uniform vec2 uResolution;
    uniform vec4 uBorderColor;
    uniform vec4 uHoverColor;
    uniform vec4 uBackgroundColor;
    uniform vec2 uMousePos;
    uniform float uZoom;
    uniform float uCellSize;
    uniform float uTextureCount;
    uniform sampler2D uImageAtlas;
    uniform sampler2D uTextAtlas;
    varying vec2 vUv;

    void main() {
      vec2 screenUV = (vUv - 0.5) * 2.0;
      float radius = length(screenUV);
      float distortion = 1.0 - 0.08 * radius * radius;
      vec2 distortedUV = screenUV * distortion;
      vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 worldCoord = distortedUV * aspectRatio;
      worldCoord *= uZoom;
      worldCoord += uOffset;
      vec2 cellPos = worldCoord / uCellSize;
      vec2 cellId = floor(cellPos);
      vec2 cellUV = fract(cellPos);
      vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
      mouseScreenUV.y = -mouseScreenUV.y;
      float mouseRadius = length(mouseScreenUV);
      float mouseDistortion = 1.0 - 0.08 * mouseRadius * mouseRadius;
      vec2 mouseDistortedUV = mouseScreenUV * mouseDistortion;
      vec2 mouseWorldCoord = mouseDistortedUV * aspectRatio;
      mouseWorldCoord *= uZoom;
      mouseWorldCoord += uOffset;
      vec2 mouseCellPos = mouseWorldCoord / uCellSize;
      vec2 mouseCellId = floor(mouseCellPos);
      vec2 cellCenter = cellId + 0.5;
      vec2 mouseCellCenter = mouseCellId + 0.5;
      float cellDistance = length(cellCenter - mouseCellCenter);
      float hoverIntensity = 1.0 - smoothstep(0.4, 0.7, cellDistance);
      bool isHovered = hoverIntensity > 0.0 && uMousePos.x >= 0.0;
      vec3 backgroundColor = uBackgroundColor.rgb;
      if (isHovered) {
        backgroundColor = mix(uBackgroundColor.rgb, uHoverColor.rgb, hoverIntensity * uHoverColor.a);
      }
      float lineWidth = 0.005;
      float gridX = smoothstep(0.0, lineWidth, cellUV.x) * smoothstep(0.0, lineWidth, 1.0 - cellUV.x);
      float gridY = smoothstep(0.0, lineWidth, cellUV.y) * smoothstep(0.0, lineWidth, 1.0 - cellUV.y);
      float gridMask = gridX * gridY;
      float imageSize = 0.6;
      float imageBorder = (1.0 - imageSize) * 0.5;
      vec2 imageUV = (cellUV - imageBorder) / imageSize;
      float edgeSmooth = 0.01;
      vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                      smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
      float imageAlpha = imageMask.x * imageMask.y;
      bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;
      float textHeight = 0.08;
      float textY = 0.88;
      bool inTextArea = cellUV.x >= 0.05 && cellUV.x <= 0.95 && cellUV.y >= textY && cellUV.y <= (textY + textHeight);
      float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
      vec3 color = backgroundColor;
      if (inImageArea && imageAlpha > 0.0) {
        float atlasSize = ceil(sqrt(uTextureCount));
        vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
        vec2 atlasUV = (atlasPos + imageUV) / atlasSize;
        atlasUV.y = 1.0 - atlasUV.y;
        vec3 imageColor = texture2D(uImageAtlas, atlasUV).rgb;
        color = mix(color, imageColor, imageAlpha);
      }
      if (inTextArea) {
        vec2 textCoord = vec2((cellUV.x - 0.05) / 0.9, (cellUV.y - textY) / textHeight);
        textCoord.y = 1.0 - textCoord.y;
        float atlasSize = ceil(sqrt(uTextureCount));
        vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
        vec2 atlasUV = (atlasPos + textCoord) / atlasSize;
        vec4 textColor = texture2D(uTextAtlas, atlasUV);
        color = mix(backgroundColor, textColor.rgb, textColor.a);
      }
      vec3 borderRGB = uBorderColor.rgb;
      float borderAlpha = uBorderColor.a;
      color = mix(color, borderRGB, (1.0 - gridMask) * borderAlpha);
      float fade = 1.0 - smoothstep(1.2, 1.8, radius);
      gl_FragColor = vec4(color * fade, 1.0);
    }
  `;

  function rgbaToArray(rgba) {
    const match = rgba.match(/rgba?\(([^)]+)\)/);
    if (!match) return [1, 1, 1, 1];
    const parts = match[1].split(",");
    return [
      parseFloat(parts[0]) / 255,
      parseFloat(parts[1]) / 255,
      parseFloat(parts[2]) / 255,
      parseFloat(parts[3] !== undefined ? parts[3] : "1"),
    ];
  }

  function createTextTexture(name, artist, textColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 2048, 256);
      ctx.font = "80px monospace";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";
      ctx.imageSmoothingEnabled = false;
      ctx.textAlign = "left";
      ctx.fillText(String(name || "").toUpperCase(), 30, 128);
      ctx.textAlign = "right";
      ctx.fillText(String(artist || "").toUpperCase(), 2048 - 30, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.flipY = false;
    texture.generateMipmaps = false;
    return texture;
  }

  function blankTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, 512, 512);
    }
    return new THREE.CanvasTexture(canvas);
  }

  function loadImageTexture(src) {
    return new Promise((resolve) => {
      if (!src) { resolve(blankTexture()); return; }
      const image = new Image();
      if (/^https?:\/\//.test(src)) image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = async () => {
        try { await image.decode(); } catch (e) {}
        const texture = new THREE.Texture(image);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = false;
        texture.needsUpdate = true;
        resolve(texture);
      };
      image.onerror = () => resolve(blankTexture());
      image.src = src;
    });
  }

  function createTextureAtlas(textures, isText) {
    const atlasSize = Math.ceil(Math.sqrt(textures.length));
    const textureSize = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = atlasSize * textureSize;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (isText) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      textures.forEach((texture, index) => {
        const x = (index % atlasSize) * textureSize;
        const y = Math.floor(index / atlasSize) * textureSize;
        const src = (texture.source && texture.source.data) || texture.image;
        if (!src) return;
        try { ctx.drawImage(src, x, y, textureSize, textureSize); } catch (e) {}
      });
    }
    const atlasTexture = new THREE.CanvasTexture(canvas);
    atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    atlasTexture.minFilter = THREE.LinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.flipY = false;
    return atlasTexture;
  }

  function initArtGallery(container, options) {
    options = options || {};
    const images = options.images || [];
    const items = options.items || [];
    const cellSize = options.cellSize || CONFIG.cellSize;
    const zoomLevel = options.zoomLevel || CONFIG.zoomLevel;
    const showHint = options.showHint !== false;

    if (!container || !images.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerpFactor = reducedMotion ? 1 : CONFIG.lerpFactor;
    const dragZoom = reducedMotion ? 1 : zoomLevel;

    container.innerHTML = "";
    container.classList.add("art-gallery-surface");

    const loader = document.createElement("div");
    loader.className = "art-gallery-loader";
    loader.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(loader);

    const canvasHost = document.createElement("div");
    canvasHost.className = "art-gallery-canvas-host";
    container.appendChild(canvasHost);

    if (showHint) {
      const hint = document.createElement("div");
      hint.className = "art-gallery-hint";
      hint.textContent = "drag to explore";
      container.appendChild(hint);
    }

    const state = {
      isDragging: false,
      previousPointer: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      targetOffset: { x: 0, y: 0 },
      mousePosition: { x: -1, y: -1 },
      zoom: 1,
      targetZoom: 1,
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const bg = rgbaToArray(CONFIG.backgroundColor);
    renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), bg[3]);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    canvasHost.appendChild(renderer.domElement);

    let plane, geometry, material, imageAtlas, textAtlas, animFrameId;
    const loadedTextures = [];
    let cancelled = false;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      state.offset.x += (state.targetOffset.x - state.offset.x) * lerpFactor;
      state.offset.y += (state.targetOffset.y - state.offset.y) * lerpFactor;
      state.zoom += (state.targetZoom - state.zoom) * lerpFactor;
      if (plane && plane.material.uniforms) {
        plane.material.uniforms.uOffset.value.set(state.offset.x, state.offset.y);
        plane.material.uniforms.uZoom.value = state.zoom;
      }
      renderer.render(scene, camera);
    }

    function updateMousePosition(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      state.mousePosition.x = event.clientX - rect.left;
      state.mousePosition.y = event.clientY - rect.top;
      if (plane) plane.material.uniforms.uMousePos.value.set(state.mousePosition.x, state.mousePosition.y);
    }

    function startDrag(x, y) {
      state.isDragging = true;
      state.previousPointer.x = x;
      state.previousPointer.y = y;
    }

    function handleMove(x, y) {
      if (!state.isDragging) return;
      const deltaX = x - state.previousPointer.x;
      const deltaY = y - state.previousPointer.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        if (state.targetZoom === 1) state.targetZoom = dragZoom;
      }
      state.targetOffset.x -= deltaX * 0.003;
      state.targetOffset.y += deltaY * 0.003;
      state.previousPointer.x = x;
      state.previousPointer.y = y;
    }

    function endDrag() {
      state.isDragging = false;
      state.targetZoom = 1;
    }

    function onPointerDown(event) {
      event.preventDefault();
      if (container.setPointerCapture) container.setPointerCapture(event.pointerId);
      startDrag(event.clientX, event.clientY);
    }
    function onPointerMove(event) {
      updateMousePosition(event);
      handleMove(event.clientX, event.clientY);
    }
    function onPointerUp(event) {
      if (container.hasPointerCapture && container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      endDrag();
    }
    function onPointerLeave() {
      state.mousePosition.x = state.mousePosition.y = -1;
      if (plane) plane.material.uniforms.uMousePos.value.set(-1, -1);
      endDrag();
    }
    function onResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (plane) plane.material.uniforms.uResolution.value.set(width, height);
    }

    function loadWithTimeout(src, ms) {
  return Promise.race([
    loadImageTexture(src),
    new Promise((resolve) => setTimeout(() => resolve(blankTexture()), ms)),
  ]);
}

Promise.all(images.map((src) => loadWithTimeout(src, 800))).then((imageTiles) => {
      if (cancelled) {
        imageTiles.forEach((t) => t.dispose());
        return;
      }
      loadedTextures.push.apply(loadedTextures, imageTiles);
      const textTextures = items.map((item) => createTextTexture(item.title, item.year, CONFIG.textColor));
      loadedTextures.push.apply(loadedTextures, textTextures);
      imageAtlas = createTextureAtlas(imageTiles, false);
      textAtlas = createTextureAtlas(textTextures, true);

      const uniforms = {
        uOffset: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        uBorderColor: { value: new THREE.Vector4(...rgbaToArray(CONFIG.borderColor)) },
        uHoverColor: { value: new THREE.Vector4(...rgbaToArray(CONFIG.hoverColor)) },
        uBackgroundColor: { value: new THREE.Vector4(...rgbaToArray(CONFIG.backgroundColor)) },
        uMousePos: { value: new THREE.Vector2(-1, -1) },
        uZoom: { value: 1 },
        uCellSize: { value: cellSize },
        uTextureCount: { value: images.length },
        uImageAtlas: { value: imageAtlas },
        uTextAtlas: { value: textAtlas },
      };

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({ vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, uniforms: uniforms });
      plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      container.addEventListener("pointerdown", onPointerDown);
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerup", onPointerUp);
      container.addEventListener("pointercancel", onPointerUp);
      container.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("resize", onResize);

      animate();
      loader.remove();
      canvasHost.style.opacity = "1";
    });
  }

  function pickTrackImage(track, playlist) {
    return (
      track.album_image ||
      track.albumImage ||
      track.image ||
      track.artwork ||
      track.cover ||
      track.coverImage ||
      (playlist && playlist.coverImage) ||
      ""
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("artGallery");
    if (!container) return;

    if (typeof THREE === "undefined") {
      console.error("Art gallery: three.js did not load — check the <script> tag order.");
      return;
    }

    fetch("https://now-playing-proxy.aremomheremy.workers.dev/playlist")
      .then((res) => res.json())
      .then((playlist) => {
        const tracks = (playlist && playlist.tracks) || [];
        if (!tracks.length) return;

        const images = tracks.map((t) => pickTrackImage(t, playlist));
        const items = tracks.map((t) => ({ title: t.name, year: t.artist }));

        initArtGallery(container, { images: images, items: items });
      })
      .catch((e) => console.error("Art gallery: playlist fetch failed", e));
  });
})();