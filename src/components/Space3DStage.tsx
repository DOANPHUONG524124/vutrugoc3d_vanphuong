import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import neonGalaxyBgUrl from '../assets/images/neon_galaxy_sky_1795815723572.jpg';
import { classifyAngle } from '../utils/angleMath';

interface Space3DStageProps {
  activeScreen: string;
  activeAngleDeg: number;
  activeTopic: 'angles' | 'perpendicular' | 'parallel' | 'shapes';
  highlightMode?: 'home' | 'explore' | 'lab' | 'challenge';
}

// Pre-allocated scratch math objects outside the animation loop (Zero-GC rule)
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.35, 0);

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

/**
 * Builds the 3D Perpendicular Lines & Beveled Triangular Ê Ke Stage for Topic 2.
 * Replaces the semicircular protractor arch completely so Grade 4 students never
 * confuse Topic 2 (Hai Đường Thẳng Vuông Góc) with Topic 1 (Đo Góc).
 */
function build3DPerpendicularHoloStage(): {
  group: THREE.Group;
  setSquareGroup: THREE.Group;
  coreGroup: THREE.Group;
} {
  const group = new THREE.Group();

  // 1. Square Holographic Base Pedestal (no circular/semicircular silhouette)
  const basePlateMat = new THREE.MeshStandardMaterial({
    color: 0x1E1B4B,
    roughness: 0.45,
    metalness: 0.55,
  });
  const baseTrimMat = new THREE.MeshStandardMaterial({
    color: 0x10B981,
    emissive: 0x059669,
    emissiveIntensity: 0.65,
    roughness: 0.22,
    metalness: 0.78,
  });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.16, 1.85), basePlateMat);
  pedestal.position.set(0, -1.52, -0.05);
  group.add(pedestal);

  const pedestalRim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.54, 0.18, 1.88)),
    new THREE.LineBasicMaterial({ color: 0x34D399 })
  );
  pedestalRim.position.copy(pedestal.position);
  group.add(pedestalRim);

  // Subtle square holographic graph-paper backdrop behind the crossing lines
  const gridBackdrop = new THREE.Group();
  const gridLinesMat = new THREE.LineBasicMaterial({
    color: 0x38BDF8,
    transparent: true,
    opacity: 0.24,
  });
  const gridFrameSize = 2.95;
  const gridStep = 0.59;
  const gridPts: THREE.Vector3[] = [];
  for (let i = -2; i <= 2; i++) {
    const offset = i * gridStep;
    gridPts.push(new THREE.Vector3(-gridFrameSize / 2, offset, -0.18));
    gridPts.push(new THREE.Vector3(gridFrameSize / 2, offset, -0.18));
    gridPts.push(new THREE.Vector3(offset, -gridFrameSize / 2, -0.18));
    gridPts.push(new THREE.Vector3(offset, gridFrameSize / 2, -0.18));
  }
  const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPts);
  gridBackdrop.add(new THREE.LineSegments(gridGeo, gridLinesMat));

  const outerSquareFrame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridFrameSize / 2, -gridFrameSize / 2, -0.17),
      new THREE.Vector3(gridFrameSize / 2, -gridFrameSize / 2, -0.17),
      new THREE.Vector3(gridFrameSize / 2, gridFrameSize / 2, -0.17),
      new THREE.Vector3(-gridFrameSize / 2, gridFrameSize / 2, -0.17),
    ]),
    new THREE.LineBasicMaterial({ color: 0x34D399, transparent: true, opacity: 0.5 })
  );
  gridBackdrop.add(outerSquareFrame);
  group.add(gridBackdrop);

  // Core assembly that holds crossing lines, 4 right-angle squares, and 3D Ê Ke
  const coreGroup = new THREE.Group();
  group.add(coreGroup);

  // 2. Horizontal Full Perpendicular Line (extends both -X and +X with arrowheads)
  const hLineMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x0284C7,
    emissiveIntensity: 0.78,
    roughness: 0.2,
    metalness: 0.5,
  });
  const hShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 3.7, 14), hLineMat);
  hShaft.rotation.z = Math.PI / 2;
  hShaft.position.set(0, 0, 0.04);
  const hConeRight = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.3, 14), hLineMat);
  hConeRight.rotation.z = -Math.PI / 2;
  hConeRight.position.set(1.94, 0, 0.04);
  const hConeLeft = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.3, 14), hLineMat);
  hConeLeft.rotation.z = Math.PI / 2;
  hConeLeft.position.set(-1.94, 0, 0.04);
  coreGroup.add(hShaft, hConeRight, hConeLeft);

  // 3. Vertical Full Perpendicular Line (extends both -Y and +Y with arrowheads)
  const vLineMat = new THREE.MeshStandardMaterial({
    color: 0xFF2E93,
    emissive: 0xDB2777,
    emissiveIntensity: 0.82,
    roughness: 0.2,
    metalness: 0.5,
  });
  const vShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 2.55, 14), vLineMat);
  vShaft.position.set(0, 0.08, 0.04);
  const vConeTop = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.3, 14), vLineMat);
  vConeTop.position.set(0, 1.44, 0.04);
  const vConeBottom = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.3, 14), vLineMat);
  vConeBottom.rotation.z = Math.PI;
  vConeBottom.position.set(0, -1.26, 0.04);
  coreGroup.add(vShaft, vConeTop, vConeBottom);

  // 4. Glowing Golden Intersection Vertex O
  const centerNodeMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    emissive: 0xEAB308,
    emissiveIntensity: 0.9,
    roughness: 0.15,
    metalness: 0.85,
  });
  const centerNode = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), centerNodeMat);
  centerNode.position.set(0, 0, 0.06);
  coreGroup.add(centerNode);

  // 5. Four Crisp 90° Right-Angle Square Symbols around Vertex O (never curved arcs!)
  const sqSize = 0.36;
  const quadrants: Array<{ sx: number; sy: number; primary: boolean }> = [
    { sx: 1, sy: 1, primary: true },
    { sx: -1, sy: 1, primary: false },
    { sx: -1, sy: -1, primary: false },
    { sx: 1, sy: -1, primary: false },
  ];
  quadrants.forEach(({ sx, sy, primary }) => {
    const qPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(sqSize, sqSize),
      new THREE.MeshBasicMaterial({
        color: primary ? 0x22C55E : 0x34D399,
        transparent: true,
        opacity: primary ? 0.38 : 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    qPlane.position.set((sx * sqSize) / 2, (sy * sqSize) / 2, 0.03);
    coreGroup.add(qPlane);

    const qOutline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx * sqSize, 0, 0.055),
        new THREE.Vector3(sx * sqSize, sy * sqSize, 0.055),
        new THREE.Vector3(0, sy * sqSize, 0.055),
      ]),
      new THREE.LineBasicMaterial({ color: primary ? 0x4ADE80 : 0x6EE7B7 })
    );
    coreGroup.add(qOutline);
  });

  // 6. Composite 3D Beveled Hollow Triangular Ê Ke (Set Square) nestled at top-right 90° corner
  const setSquareGroup = new THREE.Group();
  const legLen = 1.24;
  const outerShape = new THREE.Shape();
  outerShape.moveTo(0, 0);
  outerShape.lineTo(legLen, 0);
  outerShape.lineTo(0, legLen);
  outerShape.closePath();

  // Inner triangular cutout hole matching a real classroom Ê Ke
  const holePath = new THREE.Path();
  holePath.moveTo(0.24, 0.24);
  holePath.lineTo(0.24, legLen - 0.44);
  holePath.lineTo(legLen - 0.44, 0.24);
  holePath.closePath();
  outerShape.holes.push(holePath);

  const ekeGeo = new THREE.ExtrudeGeometry(outerShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  const ekeMat = new THREE.MeshStandardMaterial({
    color: 0x34D399,
    emissive: 0x059669,
    emissiveIntensity: 0.32,
    roughness: 0.2,
    metalness: 0.25,
    transparent: true,
    opacity: 0.84,
  });
  const ekeMesh = new THREE.Mesh(ekeGeo, ekeMat);
  setSquareGroup.add(ekeMesh);

  const ekeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(ekeGeo, 25),
    new THREE.LineBasicMaterial({ color: 0xA7F3D0 })
  );
  setSquareGroup.add(ekeEdges);

  // Ruler tick marks along the horizontal and vertical legs of the 3D Ê Ke
  const tickMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: 0xFACC15,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.4,
  });
  const tickGeoH = new THREE.BoxGeometry(0.022, 0.09, 0.02);
  const tickGeoV = new THREE.BoxGeometry(0.09, 0.022, 0.02);
  for (let i = 1; i <= 5; i++) {
    const pos = i * 0.2;
    const tH = new THREE.Mesh(tickGeoH, tickMat);
    tH.position.set(pos, 0.055, 0.13);
    setSquareGroup.add(tH);

    const tV = new THREE.Mesh(tickGeoV, tickMat);
    tV.position.set(0.055, pos, 0.13);
    setSquareGroup.add(tV);
  }

  // Highlight corner trim on the Ê Ke's 90° right-angle vertex
  const cornerAccent = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.145), baseTrimMat);
  cornerAccent.position.set(0.07, 0.07, 0.05);
  setSquareGroup.add(cornerAccent);

  // Position the 3D Ê Ke snugly in the top-right quadrant right against the perpendicular lines
  setSquareGroup.position.set(0.065, 0.065, 0.06);
  coreGroup.add(setSquareGroup);

  return { group, setSquareGroup, coreGroup };
}

/**
 * Builds the 3D Parallel Lines & Gliding Cosmic Train Stage for Topic 3.
 * Visually distinct from Topic 1 (semicircle) and Topic 2 (crossing perpendicular lines),
 * showcasing two luminous parallel rails that never meet, equal-distance perpendicular struts
 * with crisp square 90° symbols, and a 3D cosmic glider smoothly moving along the parallel track.
 */
function build3DParallelHoloStage(): {
  group: THREE.Group;
  gliderGroup: THREE.Group;
  coreGroup: THREE.Group;
} {
  const group = new THREE.Group();

  // 1. Sleek Horizontal Rectangular Pedestal Base
  const basePlateMat = new THREE.MeshStandardMaterial({
    color: 0x1E1B4B,
    roughness: 0.45,
    metalness: 0.55,
  });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.16, 1.75), basePlateMat);
  pedestal.position.set(0, -1.42, -0.05);
  group.add(pedestal);

  const pedestalRim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.14, 0.18, 1.79)),
    new THREE.LineBasicMaterial({ color: 0x38BDF8 })
  );
  pedestalRim.position.copy(pedestal.position);
  group.add(pedestalRim);

  // 2. Subtle Horizontal Parallel-Grid Holographic Backdrop
  const backdrop = new THREE.Group();
  const halfW = 1.9;
  const halfH = 1.08;
  const gridPts: THREE.Vector3[] = [];
  for (let i = -2; i <= 2; i++) {
    const y = i * 0.48;
    gridPts.push(new THREE.Vector3(-halfW, y, -0.2));
    gridPts.push(new THREE.Vector3(halfW, y, -0.2));
  }
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.58;
    gridPts.push(new THREE.Vector3(x, -halfH, -0.2));
    gridPts.push(new THREE.Vector3(x, halfH, -0.2));
  }
  backdrop.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(gridPts),
      new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.22 })
    )
  );
  backdrop.add(
    new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfW, -halfH, -0.19),
        new THREE.Vector3(halfW, -halfH, -0.19),
        new THREE.Vector3(halfW, halfH, -0.19),
        new THREE.Vector3(-halfW, halfH, -0.19),
      ]),
      new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.5 })
    )
  );
  group.add(backdrop);

  const coreGroup = new THREE.Group();
  group.add(coreGroup);

  const railOffsetY = 0.62;

  // 3. Top Luminous Parallel Line / Rail (Sky Blue, double arrowheads)
  const topRailMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x0284C7,
    emissiveIntensity: 0.82,
    roughness: 0.2,
    metalness: 0.5,
  });
  const topShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 3.85, 14), topRailMat);
  topShaft.rotation.z = Math.PI / 2;
  topShaft.position.set(0, railOffsetY, 0.06);
  const topConeR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 14), topRailMat);
  topConeR.rotation.z = -Math.PI / 2;
  topConeR.position.set(2.02, railOffsetY, 0.06);
  const topConeL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 14), topRailMat);
  topConeL.rotation.z = Math.PI / 2;
  topConeL.position.set(-2.02, railOffsetY, 0.06);
  coreGroup.add(topShaft, topConeR, topConeL);

  // 4. Bottom Luminous Parallel Line / Rail (Emerald Green, double arrowheads)
  const botRailMat = new THREE.MeshStandardMaterial({
    color: 0x34D399,
    emissive: 0x059669,
    emissiveIntensity: 0.82,
    roughness: 0.2,
    metalness: 0.5,
  });
  const botShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 3.85, 14), botRailMat);
  botShaft.rotation.z = Math.PI / 2;
  botShaft.position.set(0, -railOffsetY, 0.06);
  const botConeR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 14), botRailMat);
  botConeR.rotation.z = -Math.PI / 2;
  botConeR.position.set(2.02, -railOffsetY, 0.06);
  const botConeL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 14), botRailMat);
  botConeL.rotation.z = Math.PI / 2;
  botConeL.position.set(-2.02, -railOffsetY, 0.06);
  coreGroup.add(botShaft, botConeR, botConeL);

  // 5. Equal-Distance Vertical Sleepers / Struts + Crisp 90° Right-Angle Squares
  const strutMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    emissive: 0xCA8A04,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.55,
  });
  const strutXs = [-1.25, 0, 1.25];
  const sqSize = 0.22;
  strutXs.forEach((sx) => {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, railOffsetY * 2, 10),
      strutMat
    );
    strut.position.set(sx, 0, -0.02);
    coreGroup.add(strut);

    // Top & bottom small crisp 90° square markers on outer struts
    if (sx !== 0) {
      const dir = sx < 0 ? 1 : -1;
      // Top junction square
      coreGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sx + dir * sqSize, railOffsetY, 0.03),
            new THREE.Vector3(sx + dir * sqSize, railOffsetY - sqSize, 0.03),
            new THREE.Vector3(sx, railOffsetY - sqSize, 0.03),
          ]),
          new THREE.LineBasicMaterial({ color: 0xFDE047 })
        )
      );
      // Bottom junction square
      coreGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sx + dir * sqSize, -railOffsetY, 0.03),
            new THREE.Vector3(sx + dir * sqSize, -railOffsetY + sqSize, 0.03),
            new THREE.Vector3(sx, -railOffsetY + sqSize, 0.03),
          ]),
          new THREE.LineBasicMaterial({ color: 0xFDE047 })
        )
      );
    }
  });

  // 6. Composite 3D Cosmic Hover-Train / Glider cruising smoothly between the two parallel rails
  const gliderGroup = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    roughness: 0.22,
    metalness: 0.45,
  });
  const accentPinkMat = new THREE.MeshStandardMaterial({
    color: 0xFF2E93,
    emissive: 0xDB2777,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.4,
  });
  const windowGoldMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    emissive: 0xEAB308,
    emissiveIntensity: 0.78,
    roughness: 0.15,
    metalness: 0.7,
  });

  // Main train hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 0.36), hullMat);
  gliderGroup.add(hull);

  // Pink racing stripe along hull
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.1, 0.38), accentPinkMat);
  stripe.position.set(0, -0.09, 0);
  gliderGroup.add(stripe);

  // Golden panoramic cockpit windows
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.38), windowGoldMat);
  cockpit.position.set(0, 0.08, 0);
  gliderGroup.add(cockpit);

  // Aerodynamic twin nose caps (left & right so shuttle glides smoothly both directions)
  const noseGeo = new THREE.ConeGeometry(0.21, 0.32, 16);
  const noseRight = new THREE.Mesh(noseGeo, accentPinkMat);
  noseRight.rotation.z = -Math.PI / 2;
  noseRight.position.set(0.62, 0, 0);
  const noseLeft = new THREE.Mesh(noseGeo, accentPinkMat);
  noseLeft.rotation.z = Math.PI / 2;
  noseLeft.position.set(-0.62, 0, 0);
  gliderGroup.add(noseRight, noseLeft);

  // Top & bottom magnetic rail shoes hugging the parallel rails
  const shoeGeo = new THREE.BoxGeometry(0.46, 0.1, 0.16);
  const topShoe = new THREE.Mesh(shoeGeo, windowGoldMat);
  topShoe.position.set(0, 0.3, 0);
  const botShoe = new THREE.Mesh(shoeGeo, windowGoldMat);
  botShoe.position.set(0, -0.3, 0);
  gliderGroup.add(topShoe, botShoe);

  gliderGroup.position.set(0, 0, 0.16);
  coreGroup.add(gliderGroup);

  return { group, gliderGroup, coreGroup };
}

/**
 * Builds the 3D Parallelogram & Rhombus Crystals Stage for Topic 4.
 * Side-by-side beveled 3D translucent Parallelogram (sky/cyan) and Rhombus (fuchsia/gold)
 * hovering above a sleek pedestal with crisp glowing wireframe edges.
 */
function build3DShapesHoloStage(): {
  group: THREE.Group;
  paraCrystal: THREE.Group;
  rhombusCrystal: THREE.Group;
} {
  const group = new THREE.Group();

  // 1. Sleek Pedestal Base
  const basePlateMat = new THREE.MeshStandardMaterial({
    color: 0x1E1B4B,
    roughness: 0.42,
    metalness: 0.58,
  });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 1.8), basePlateMat);
  pedestal.position.set(0, -1.35, -0.05);
  group.add(pedestal);

  const pedestalRim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.44, 0.18, 1.84)),
    new THREE.LineBasicMaterial({ color: 0xE879F9 })
  );
  pedestalRim.position.copy(pedestal.position);
  group.add(pedestalRim);

  // 2. Left Crystal: 3D Beveled Parallelogram (Sky-Cyan + Gold Accent Edges)
  const paraCrystal = new THREE.Group();
  const paraShape = new THREE.Shape();
  paraShape.moveTo(-0.92, -0.52);
  paraShape.lineTo(0.62, -0.52);
  paraShape.lineTo(0.92, 0.52);
  paraShape.lineTo(-0.62, 0.52);
  paraShape.closePath();

  const paraGeo = new THREE.ExtrudeGeometry(paraShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  paraGeo.center();

  const paraMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x0284C7,
    emissiveIntensity: 0.42,
    roughness: 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.86,
  });
  paraCrystal.add(new THREE.Mesh(paraGeo, paraMat));
  paraCrystal.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(paraGeo, 20),
      new THREE.LineBasicMaterial({ color: 0xBAE6FD })
    )
  );
  paraCrystal.position.set(-1.12, 0.12, 0.12);
  group.add(paraCrystal);

  // 3. Right Crystal: 3D Beveled Rhombus (Fuchsia-Magenta + Golden Rim)
  const rhombusCrystal = new THREE.Group();
  const rhomShape = new THREE.Shape();
  rhomShape.moveTo(-0.88, 0);
  rhomShape.lineTo(0, 0.78);
  rhomShape.lineTo(0.88, 0);
  rhomShape.lineTo(0, -0.78);
  rhomShape.closePath();

  const rhomGeo = new THREE.ExtrudeGeometry(rhomShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  rhomGeo.center();

  const rhomMat = new THREE.MeshStandardMaterial({
    color: 0xE879F9,
    emissive: 0xA21CAF,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.38,
    transparent: true,
    opacity: 0.88,
  });
  rhombusCrystal.add(new THREE.Mesh(rhomGeo, rhomMat));
  rhombusCrystal.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(rhomGeo, 20),
      new THREE.LineBasicMaterial({ color: 0xFDE047 })
    )
  );
  rhombusCrystal.position.set(1.14, 0.12, 0.12);
  group.add(rhombusCrystal);

  // Subtle glowing connector rings beneath each crystal
  const ringGeo = new THREE.RingGeometry(0.45, 0.56, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const leftRing = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  leftRing.position.set(-1.12, -1.24, 0.1);
  const rightRing = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: 0xE879F9, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  rightRing.position.set(1.14, -1.24, 0.1);
  group.add(leftRing, rightRing);

  return { group, paraCrystal, rhombusCrystal };
}

function resolveStageTopicMode(
  topic: 'angles' | 'perpendicular' | 'parallel' | 'shapes',
  screen: string
): 'angles' | 'perpendicular' | 'parallel' | 'shapes' {
  if (screen.startsWith('shapes-')) return 'shapes';
  if (screen.startsWith('par-')) return 'parallel';
  if (screen.startsWith('perp-') || screen.startsWith('perp_')) return 'perpendicular';
  if (
    screen === 'explore' ||
    screen === 'lab' ||
    screen === 'tutorial' ||
    screen === 'challenge' ||
    screen === 'library'
  ) {
    return 'angles';
  }
  return topic;
}

export const Space3DStage: React.FC<Space3DStageProps> = ({
  activeScreen,
  activeAngleDeg,
  activeTopic,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ activeScreen, activeAngleDeg, activeTopic });

  useEffect(() => {
    stateRef.current = { activeScreen, activeAngleDeg, activeTopic };
  }, [activeScreen, activeAngleDeg, activeTopic]);

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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
    camera.position.set(0, 1.35, 9.3);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio PBR Environment reflection (skip on software WebGL for instant first-frame paint)
    let envTarget: THREE.WebGLRenderTarget | null = null;
    if (!isSoftwareGl) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envTarget.texture;
      pmremGenerator.dispose();
    }

    // Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x818CF8, 0x0B0726, 1.0);
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

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 0.85);
    rimLight.position.set(-7, 4, -5);
    scene.add(rimLight);

    // 1a. Build Topic 1: 3D Holographic Angle Stage (semicircular protractor arch)
    const holoStage = build3DAngleHoloStage();
    holoStage.group.position.set(0, -1.05, 0);
    scene.add(holoStage.group);

    // 1b. Build Topic 2: 3D Perpendicular Lines + 4 Right Angles + Beveled Ê Ke Stage
    const perpStage = build3DPerpendicularHoloStage();
    perpStage.group.position.set(0, -0.25, 0.35);
    scene.add(perpStage.group);

    // 1c. Build Topic 3: 3D Parallel Lines + Equal-Distance Struts + Gliding Cosmic Train
    const parStage = build3DParallelHoloStage();
    parStage.group.position.set(0, -0.15, 0.42);
    scene.add(parStage.group);

    // 1d. Build Topic 4: 3D Parallelogram & Rhombus Crystals Stage
    const shapesStage = build3DShapesHoloStage();
    shapesStage.group.position.set(0, -0.18, 0.44);
    scene.add(shapesStage.group);

    const initialStageMode = resolveStageTopicMode(
      stateRef.current.activeTopic,
      stateRef.current.activeScreen
    );
    holoStage.group.visible = initialStageMode === 'angles';
    perpStage.group.visible = initialStageMode === 'perpendicular';
    parStage.group.visible = initialStageMode === 'parallel';
    shapesStage.group.visible = initialStageMode === 'shapes';

    // 2. Delicate Neon Twinkling Starfield (InstancedMesh — no giant distracting planets)
    const starCount = 120;
    const starGeo = new THREE.OctahedronGeometry(0.055, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starInstanced = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const dummy = new THREE.Object3D();
    const starColors = [
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0x38BDF8),
      new THREE.Color(0xA855F7),
      new THREE.Color(0x22D3EE),
    ];

    for (let i = 0; i < starCount; i++) {
      const t = i / starCount;
      const angle = i * 2.39996;
      const dist = 7 + (i % 16) * 1.45;
      dummy.position.set(
        Math.cos(angle) * dist,
        (t - 0.5) * 15,
        -4 - (i % 12) * 1.5
      );
      const s = 0.55 + (i % 4) * 0.25;
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
    let lastStageMode: 'angles' | 'perpendicular' | 'parallel' | 'shapes' = initialStageMode;
    let activeStagePopScale = 1;
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

      const { activeScreen: scr, activeAngleDeg: targetDeg, activeTopic: topic } = stateRef.current;
      const stageMode = resolveStageTopicMode(topic, scr);

      // Mutually exclusive visibility so Topic 1, Topic 2, and Topic 3 stages NEVER overlap
      if (stageMode !== lastStageMode) {
        lastStageMode = stageMode;
        activeStagePopScale = 0.88;
      }
      activeStagePopScale = THREE.MathUtils.damp(activeStagePopScale, 1, 10, dt);

      holoStage.group.visible = stageMode === 'angles';
      perpStage.group.visible = stageMode === 'perpendicular';
      parStage.group.visible = stageMode === 'parallel';
      shapesStage.group.visible = stageMode === 'shapes';

      if (stageMode === 'perpendicular') {
        perpStage.group.scale.setScalar(activeStagePopScale * 1.06);
      } else if (stageMode === 'parallel') {
        parStage.group.scale.setScalar(activeStagePopScale * 1.04);
      } else if (stageMode === 'shapes') {
        shapesStage.group.scale.setScalar(activeStagePopScale * 1.04);
      } else {
        holoStage.group.scale.setScalar(activeStagePopScale);
      }

      // Topic 1: Smoothly damp angle opening in 3D space
      currentDisplayedDeg = THREE.MathUtils.damp(currentDisplayedDeg, targetDeg, 6, dt);
      holoStage.rayBMesh.rotation.z = THREE.MathUtils.degToRad(currentDisplayedDeg);
      holoStage.updateArcGeometry(currentDisplayedDeg);

      // Topic 2: Subtle 3D breathing & gentle showcase sway for Perpendicular Lines + Ê Ke
      perpStage.group.rotation.y = Math.sin(elapsed * 0.85) * 0.14;
      const ekePulse = (Math.sin(elapsed * 1.9) + 1) * 0.5; // 0..1
      perpStage.setSquareGroup.position.set(
        0.065 + ekePulse * 0.04,
        0.065 + ekePulse * 0.04,
        0.06 + ekePulse * 0.035
      );

      // Topic 3: Gentle sway + cosmic hover-train gliding cleanly along parallel rails
      parStage.group.rotation.y = Math.sin(elapsed * 0.75) * 0.13;
      parStage.gliderGroup.position.x = Math.sin(elapsed * 1.35) * 1.05;
      parStage.gliderGroup.position.y = Math.sin(elapsed * 3.2) * 0.025;

      // Topic 4: Floating beveled 3D Parallelogram & Rhombus crystals
      shapesStage.group.rotation.y = Math.sin(elapsed * 0.65) * 0.12;
      shapesStage.paraCrystal.position.y = 0.14 + Math.sin(elapsed * 1.8) * 0.11;
      shapesStage.paraCrystal.rotation.y = Math.sin(elapsed * 1.1) * 0.35;
      shapesStage.rhombusCrystal.position.y = 0.14 + Math.cos(elapsed * 1.8) * 0.11;
      shapesStage.rhombusCrystal.rotation.y = -Math.sin(elapsed * 1.15) * 0.38;

      // Gentle drift for neon micro-starfield
      starInstanced.rotation.z = elapsed * 0.015;

      // Camera choreography per screen (framed cleanly inside wide center showcase)
      if (scr === 'home') {
        _targetCameraPos.set(0, 1.3, 10.6);
        _targetLookAt.set(0, 0.28, 0);
      } else if (scr === 'explore') {
        _targetCameraPos.set(0.4, 1.1, 7.6);
        _targetLookAt.set(0, 0.3, 0);
      } else {
        _targetCameraPos.set(0, 2.5, 11.4);
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
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isUnmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      if (envTarget) envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#07041A]"
      aria-hidden="true"
    >
      {/* Shimmering Neon Glowing Galaxy Sky Background Image */}
      <img
        src={neonGalaxyBgUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-90 scale-[1.02]"
      />
      {/* Subtle deep-space radial veil so central 3D models & crisp UI text stand out effortlessly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(7, 4, 26, 0.18) 0%, rgba(7, 4, 26, 0.45) 68%, rgba(5, 3, 20, 0.72) 100%)',
        }}
      />
      {/* Transparent Three.js WebGL Stage */}
      <div
        ref={mountRef}
        data-testid="space-3d-canvas-container"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
