import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { classifyAngle } from '../utils/angleMath';

interface Space3DStageProps {
  activeScreen: string;
  activeAngleDeg: number;
  highlightMode?: 'home' | 'explore' | 'lab' | 'challenge';
}

// Pre-allocated scratch math objects outside the animation loop (Zero-GC rule)
const _scratchVec3 = new THREE.Vector3();
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.5, 0);

function createPlanetCanvasTexture(baseHex: string, stripeHex: string, rendererMaxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = stripeHex;
    for (let y = 12; y < 120; y += 22) {
      ctx.globalAlpha = 0.35;
      ctx.fillRect(0, y, 256, 8);
    }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc((i * 47) % 256, (i * 29) % 128, 4 + (i % 6), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = rendererMaxAnisotropy;
  return tex;
}

const COMPANION_ROBOT_IMG_URL = '/assets/aistudio/Th_m_ti_u____9352a9ad.png';

/**
 * Builds the floating 3D Companion Robot billboard using the attached character artwork
 * with a soft contact shadow disc underneath.
 */
function buildMathRobotGroup(
  maxAnisotropy: number,
  texturesToDispose: THREE.Texture[]
): THREE.Group {
  const robot = new THREE.Group();

  // 1. Contact shadow disc at y = 0.015
  const shadowGeo = new THREE.CircleGeometry(1.15, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.015;
  robot.add(shadowMesh);

  // 2. Character cutout plane (aspect 3120x1755 = 16:9)
  const loader = new THREE.TextureLoader();
  const charTex = loader.load(COMPANION_ROBOT_IMG_URL);
  charTex.colorSpace = THREE.SRGBColorSpace;
  charTex.anisotropy = maxAnisotropy;
  texturesToDispose.push(charTex);

  const planeHeight = 3.5;
  const planeWidth = planeHeight * (3120 / 1755);
  const charGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const charMat = new THREE.MeshBasicMaterial({
    map: charTex,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
  });
  const charMesh = new THREE.Mesh(charGeo, charMat);
  charMesh.position.y = planeHeight / 2 + 0.1;
  robot.add(charMesh);

  return robot;
}

/**
 * Builds the 3D Holographic Angle Stage in the center of the cosmic arena
 * Shows Vertex O, Ray OA, Ray OB, and dynamic degree sector arc in 3D space.
 */
function build3DAngleHoloStage(): {
  group: THREE.Group;
  rayBMesh: THREE.Group;
  arcMesh: THREE.Mesh;
  rightSquareMesh: THREE.Group;
  updateArcGeometry: (deg: number) => void;
} {
  const group = new THREE.Group();

  // Base platform disc (multi-part)
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x1E1B4B,
    roughness: 0.4,
    metalness: 0.6,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x0284C7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });

  const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.22, 36), platformMat);
  baseDisc.position.y = -0.15;
  group.add(baseDisc);

  // Semicircular 180° holographic protractor arch on the platform
  const archRing = new THREE.Mesh(
    new THREE.RingGeometry(2.15, 2.55, 36, 1, 0, Math.PI),
    rimMat
  );
  archRing.position.set(0, 0.1, -0.05);
  group.add(archRing);

  // Vertex O glowing sphere
  const vertexMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    emissive: 0xFACC15,
    emissiveIntensity: 0.8,
    roughness: 0.15,
    metalness: 0.8,
  });
  const vertexSphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), vertexMat);
  vertexSphere.position.set(0, 0.1, 0.05);
  group.add(vertexSphere);

  // Ray OA (Base Ray along +X)
  const rayAMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });
  const rayAGroup = new THREE.Group();
  const rayACyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 12), rayAMat);
  rayACyl.rotation.z = -Math.PI / 2;
  rayACyl.position.x = 1.2;
  const rayACone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 12), rayAMat);
  rayACone.rotation.z = -Math.PI / 2;
  rayACone.position.x = 2.45;
  rayAGroup.add(rayACyl, rayACone);
  rayAGroup.position.set(0, 0.1, 0.05);
  group.add(rayAGroup);

  // Ray OB (Rotating Ray)
  const rayBMat = new THREE.MeshStandardMaterial({
    color: 0xFF2E93,
    emissive: 0xFF2E93,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const rayBMesh = new THREE.Group();
  const rayBCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 12), rayBMat);
  rayBCyl.rotation.z = -Math.PI / 2;
  rayBCyl.position.x = 1.2;
  const rayBCone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 12), rayBMat);
  rayBCone.rotation.z = -Math.PI / 2;
  rayBCone.position.x = 2.45;
  rayBMesh.add(rayBCyl, rayBCone);
  rayBMesh.position.set(0, 0.1, 0.05);
  group.add(rayBMesh);

  // Dynamic Angle Sector Mesh
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0xFACC15,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const initialArcGeo = new THREE.CircleGeometry(1.15, 32, 0, Math.PI / 4);
  const arcMesh = new THREE.Mesh(initialArcGeo, arcMat);
  arcMesh.position.set(0, 0.1, 0.03);
  group.add(arcMesh);

  // 90° Right-Angle Square Marker (Filled square plane + crisp border, no curved arc)
  const rightSquareMesh = new THREE.Group();
  const sqSize3D = 0.68;
  const sqPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(sqSize3D, sqSize3D),
    new THREE.MeshBasicMaterial({
      color: 0x22C55E,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  sqPlane.position.set(sqSize3D / 2, sqSize3D / 2, 0);
  const sqPts = [
    new THREE.Vector3(sqSize3D, 0, 0.01),
    new THREE.Vector3(sqSize3D, sqSize3D, 0.01),
    new THREE.Vector3(0, sqSize3D, 0.01),
    new THREE.Vector3(0, 0, 0.01),
  ];
  const sqOutline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(sqPts),
    new THREE.LineBasicMaterial({ color: 0x4ADE80 })
  );
  rightSquareMesh.add(sqPlane, sqOutline);
  rightSquareMesh.position.set(0, 0.1, 0.06);
  rightSquareMesh.visible = false;
  group.add(rightSquareMesh);

  let lastBuiltDeg = -1;
  const updateArcGeometry = (deg: number) => {
    const rounded = Math.max(1, Math.min(360, Math.round(deg)));
    if (rounded === lastBuiltDeg) return;
    lastBuiltDeg = rounded;

    const rad = THREE.MathUtils.degToRad(rounded);
    arcMesh.geometry.dispose();
    arcMesh.geometry = new THREE.CircleGeometry(1.15, 36, 0, rad);

    const cls = classifyAngle(rounded);
    (arcMesh.material as THREE.MeshBasicMaterial).color.set(cls.colorHex);
    arcMesh.visible = rounded !== 90;
    rightSquareMesh.visible = rounded === 90;
  };

  return { group, rayBMesh, arcMesh, rightSquareMesh, updateArcGeometry };
}

export const Space3DStage: React.FC<Space3DStageProps> = ({
  activeScreen,
  activeAngleDeg,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ activeScreen, activeAngleDeg });

  useEffect(() => {
    stateRef.current = { activeScreen, activeAngleDeg };
  }, [activeScreen, activeAngleDeg]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL (SwiftShader / llvmpipe) per threejs skill
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B0726);
    scene.fog = new THREE.FogExp2(0x0B0726, 0.018);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
    camera.position.set(0, 2.2, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio PBR Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x818CF8, 0x0B0726, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFF3D1, 1.55);
    keyLight.position.set(6, 10, 7);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xFF2E93, 0.75);
    rimLight.position.set(-7, 4, -5);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const texturesToDispose: THREE.Texture[] = [];

    // 1. Build 3D Math Robot on left side
    const robotGroup = buildMathRobotGroup(maxAniso, texturesToDispose);
    robotGroup.position.set(-3.8, -1.35, 1.2);
    robotGroup.rotation.y = 0.22;
    scene.add(robotGroup);

    // 2. Build 3D Holographic Angle Stage in center
    const holoStage = build3DAngleHoloStage();
    holoStage.group.position.set(0, -0.45, 0);
    scene.add(holoStage.group);

    // 3. Build 4 Orbiting Planets around the universe
    const planetConfigs = [
      { pos: [-5.5, 2.6, -4.5], radius: 0.75, base: '#FACC15', stripe: '#CA8A04', hasRing: true },
      { pos: [5.2, 2.8, -5.0], radius: 0.95, base: '#FF2E93', stripe: '#9D174D', hasRing: true },
      { pos: [4.6, -1.8, -3.8], radius: 0.65, base: '#22C55E', stripe: '#15803D', hasRing: false },
      { pos: [-4.8, -2.1, -6.0], radius: 0.8, base: '#38BDF8', stripe: '#0369A1', hasRing: false },
    ];
    const planets: THREE.Group[] = [];

    planetConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

      const tex = createPlanetCanvasTexture(cfg.base, cfg.stripe, maxAniso);
      texturesToDispose.push(tex);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        roughness: 0.55,
        metalness: 0.15,
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, 24, 24), pMat);
      pGroup.add(sphere);

      if (cfg.hasRing) {
        const ringMat = new THREE.MeshStandardMaterial({
          color: cfg.base,
          roughness: 0.35,
          metalness: 0.5,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(cfg.radius * 1.35, cfg.radius * 1.85, 32),
          ringMat
        );
        ring.rotation.x = Math.PI * 0.4;
        ring.rotation.y = 0.25;
        pGroup.add(ring);
      }

      scene.add(pGroup);
      planets.push(pGroup);
    });

    // 4. InstancedMesh Starfield (160 stars -> InstancedMesh per >20 items rule)
    const starCount = 160;
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starInstanced = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const dummy = new THREE.Object3D();
    const starColors = [new THREE.Color(0xFFFFFF), new THREE.Color(0xFACC15), new THREE.Color(0x38BDF8), new THREE.Color(0xFF2E93)];

    for (let i = 0; i < starCount; i++) {
      // Deterministic golden-ratio spiral distribution
      const t = i / starCount;
      const angle = i * 2.39996;
      const dist = 6 + (i % 18) * 1.4;
      dummy.position.set(
        Math.cos(angle) * dist,
        (t - 0.5) * 16,
        -3 - (i % 15) * 1.5
      );
      const s = 0.6 + (i % 5) * 0.28;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      starInstanced.setMatrixAt(i, dummy.matrix);
      starInstanced.setColorAt(i, starColors[i % starColors.length]);
    }
    starInstanced.instanceMatrix.needsUpdate = true;
    if (starInstanced.instanceColor) starInstanced.instanceColor.needsUpdate = true;
    starInstanced.computeBoundingSphere();
    scene.add(starInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let isUnmounted = false;
    let currentDisplayedDeg = stateRef.current.activeAngleDeg;
    const startTimeMs = performance.now();
    let lastTimeMs = startTimeMs;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isUnmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isUnmounted) return;
      const nowMs = performance.now();
      const rawDt = (nowMs - lastTimeMs) / 1000;
      lastTimeMs = nowMs;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      const elapsed = (nowMs - startTimeMs) / 1000;

      const { activeScreen: scr, activeAngleDeg: targetDeg } = stateRef.current;

      // Smoothly damp angle opening in 3D space
      currentDisplayedDeg = THREE.MathUtils.damp(currentDisplayedDeg, targetDeg, 6, dt);
      holoStage.rayBMesh.rotation.z = THREE.MathUtils.degToRad(currentDisplayedDeg);
      holoStage.updateArcGeometry(currentDisplayedDeg);

      // Gentle idle animation for Robot & Planets
      robotGroup.position.y = -1.35 + Math.sin(elapsed * 2.1) * 0.12;
      robotGroup.rotation.y = 0.22 + Math.sin(elapsed * 1.2) * 0.08;

      for (let i = 0; i < planets.length; i++) {
        planets[i].rotation.y = elapsed * (0.25 + i * 0.08);
      }

      // Camera choreography per screen
      if (scr === 'home') {
        _targetCameraPos.set(0, 1.4, 8.8);
        _targetLookAt.set(0, 0.4, 0);
      } else if (scr === 'explore') {
        _targetCameraPos.set(0.4, 1.1, 7.2);
        _targetLookAt.set(0, 0.3, 0);
      } else {
        _targetCameraPos.set(0, 2.6, 11.2);
        _targetLookAt.set(0, 0, 0);
      }

      const dampFactor = 1 - Math.exp(-4 * dt);
      camera.position.lerp(_targetCameraPos, dampFactor);
      _currentLookAt.lerp(_targetLookAt, dampFactor);
      camera.lookAt(_currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isUnmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      envTarget.dispose();
      texturesToDispose.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="space-3d-canvas-container"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
