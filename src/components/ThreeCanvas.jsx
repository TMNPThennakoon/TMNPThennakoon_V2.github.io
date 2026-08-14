import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const THREE_PRESETS = [
  { id: 'icosahedron', name: '1. Glowing Tech Sphere & Ambient Dust' },
  { id: 'cyberGrid', name: '2. 3D Cyber Perspective Grid' },
  { id: 'dnaHelix', name: '3. Rotating 3D DNA Particle Lattice' },
  { id: 'torusKnot', name: '4. Soft Wireframe Torus Knot' },
  { id: 'cosmicConstellation', name: '5. Subtle Star Constellation Net' },
  { id: 'quantumWaves', name: '6. Quantum Sine Wave Field' },
  { id: 'matrixRain', name: '7. Ambient Digital Code Stream' },
  { id: 'hyperCube', name: '8. 4D Tesseract Minimalist Cube' },
  { id: 'galaxySwirl', name: '9. Soft Spiral Galaxy Vortex' },
  { id: 'neonPlexus', name: '10. Floating Subtle Neon Nodes' },
  { id: 'gyroscopeRings', name: '11. Dual Gyroscope Automation Rings' },
  { id: 'particleCore', name: '12. Ambient Core & Cosmic Dust' },
  { id: 'warpSpeed', name: '13. Hyperspace Star Tunnel' },
  { id: 'circuitGrid', name: '14. 3D Electronic Circuit Grid' },
  { id: 'crystalOctahedrons', name: '15. Subtle Octahedron Clusters' },
  { id: 'mobiusStrip', name: '16. Floating Infinite Mobius Ribbon' },
  { id: 'dodecahedronCluster', name: '17. Sacred Dodecahedron Geometry' },
  { id: 'blackHoleVortex', name: '18. Accretion Gravity Waves' },
  { id: 'neuralNetworkLattice', name: '19. 3D Brain Synapse Neural Net' },
  { id: 'holographicPyramid', name: '20. Holographic Quad-Pyramids' },
  { id: 'particleTunnel', name: '21. Velocity Ring Particle Tunnel' },
  { id: 'atomModel', name: '22. 3D Atomic Nucleus & Electrons' },
  { id: 'cyberHexagonGrid', name: '23. Floating Honeycomb Hexagons' },
  { id: 'auroraWaveBands', name: '24. 3D Ambient Aurora Wave Strips' },
  { id: 'stellarConstellationGlobe', name: '25. Celestial Star Globe Lattice' },
];

function ThreeCanvas({ 
  preset = 'icosahedron', 
  autoRandom = false, 
  changeInterval = 20, // in seconds
  interactive = true,
  className = "absolute inset-0 z-0"
}) {
  const mountRef = useRef(null);
  const [currentPreset, setCurrentPreset] = useState(preset);

  // Sync prop changes
  useEffect(() => {
    setCurrentPreset(preset);
  }, [preset]);

  // Handle Auto-Random switching timer
  useEffect(() => {
    if (!autoRandom) return;
    const interval = setInterval(() => {
      setCurrentPreset((prev) => {
        const remaining = THREE_PRESETS.filter(p => p.id !== prev);
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        return random ? random.id : 'icosahedron';
      });
    }, (changeInterval || 20) * 1000);

    return () => clearInterval(interval);
  }, [autoRandom, changeInterval]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const animatedObjects = [];
    let animationFrameId = null;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseX = (e.clientX / width - 0.5) * 0.4;
      mouseY = (e.clientY / height - 0.5) * 0.4;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    camera.position.z = 5;

    // Helper for vibrant glowing ambient particles
    const createAmbientDust = (count = 450, size = 0.038, color = 0x38bdf8) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 26;
        pos[i + 1] = (Math.random() - 0.5) * 16;
        pos[i + 2] = (Math.random() - 0.5) * 14;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ size, color, transparent: true, opacity: 0.65 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return points;
    };

    // --- VIBRANT 3D PRESET RENDERERS ---
    switch (currentPreset) {
      case 'mobiusStrip': {
        const geo = new THREE.TorusGeometry(2.2, 0.35, 16, 100);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.28 });
        const mobius = new THREE.Mesh(geo, mat);
        mobius.position.set(2.2, 0, -1);
        mobius.rotation.x = Math.PI / 3;
        scene.add(mobius);
        const dust = createAmbientDust(450, 0.038, 0x10b981);
        animatedObjects.push({
          update: (time) => {
            mobius.rotation.z = time * 0.25;
            mobius.rotation.y = time * 0.15;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'dodecahedronCluster': {
        const geo = new THREE.DodecahedronGeometry(2, 0);
        const mat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.28 });
        const dodeca = new THREE.Mesh(geo, mat);
        dodeca.position.set(2.2, 0, -1);
        scene.add(dodeca);
        const dust = createAmbientDust(450, 0.038, 0x38bdf8);
        animatedObjects.push({
          update: (time) => {
            dodeca.rotation.x = time * 0.15;
            dodeca.rotation.y = time * 0.2;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'blackHoleVortex': {
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const r = 1.5 + Math.random() * 6.5;
          const theta = Math.random() * Math.PI * 2 + r * 0.8;
          pos[i * 3] = r * Math.cos(theta) + 2.2;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
          pos[i * 3 + 2] = r * Math.sin(theta) - 1;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.045, color: 0x38bdf8, transparent: true, opacity: 0.7 });
        const vortex = new THREE.Points(geo, mat);
        vortex.rotation.x = 0.4;
        scene.add(vortex);
        animatedObjects.push({
          update: (time) => {
            vortex.rotation.y = time * 0.25;
          }
        });
        break;
      }

      case 'neuralNetworkLattice': {
        const group = new THREE.Group();
        group.position.set(2, 0, -1);
        const nodeCount = 35;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          const pGeo = new THREE.SphereGeometry(0.1, 6, 6);
          const pMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981, transparent: true, opacity: 0.8 });
          const p = new THREE.Mesh(pGeo, pMat);
          p.position.set((Math.random() - 0.5) * 8.5, (Math.random() - 0.5) * 6.5, (Math.random() - 0.5) * 5);
          group.add(p);
          nodes.push(p);
        }
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            if (nodes[i].position.distanceTo(nodes[j].position) < 3.2) {
              const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
              const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
              group.add(new THREE.Line(lineGeo, lineMat));
            }
          }
        }
        scene.add(group);
        animatedObjects.push({
          update: (time) => {
            group.rotation.y = time * 0.12;
          }
        });
        break;
      }

      case 'holographicPyramid': {
        const group = new THREE.Group();
        group.position.set(2.2, 0, -1);
        for (let i = 0; i < 4; i++) {
          const geo = new THREE.ConeGeometry(1.3 + i * 0.4, 2 + i * 0.3, 4);
          const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.28 });
          const pyr = new THREE.Mesh(geo, mat);
          pyr.rotation.y = i * 0.4;
          group.add(pyr);
        }
        scene.add(group);
        const dust = createAmbientDust(400, 0.038, 0x10b981);
        animatedObjects.push({
          update: (time) => {
            group.rotation.y = time * 0.2;
            group.rotation.x = Math.sin(time * 0.1) * 0.15;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'particleTunnel': {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const radius = 2.5 + Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          pos[i * 3] = radius * Math.cos(theta) + 2.2;
          pos[i * 3 + 1] = radius * Math.sin(theta);
          pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.048, color: 0x38bdf8, transparent: true, opacity: 0.7 });
        const tunnel = new THREE.Points(geo, mat);
        scene.add(tunnel);
        animatedObjects.push({
          update: (time) => {
            tunnel.rotation.z = time * 0.2;
          }
        });
        break;
      }

      case 'atomModel': {
        const group = new THREE.Group();
        group.position.set(2.2, 0, -1);
        const coreGeo = new THREE.SphereGeometry(0.7, 14, 14);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
        group.add(new THREE.Mesh(coreGeo, coreMat));

        for (let i = 0; i < 3; i++) {
          const ringGeo = new THREE.TorusGeometry(2.1 + i * 0.3, 0.03, 16, 80);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = i * Math.PI / 3;
          ring.rotation.y = i * Math.PI / 4;
          group.add(ring);
        }
        scene.add(group);
        animatedObjects.push({
          update: (time) => {
            group.rotation.y = time * 0.25;
            group.rotation.z = time * 0.15;
          }
        });
        break;
      }

      case 'cyberHexagonGrid': {
        const group = new THREE.Group();
        group.position.set(2.2, 0, -1);
        for (let i = 0; i < 7; i++) {
          const geo = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 6);
          const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 });
          const hex = new THREE.Mesh(geo, mat);
          const angle = i * Math.PI / 3;
          const r = i === 0 ? 0 : 1.75;
          hex.position.set(r * Math.cos(angle), r * Math.sin(angle), 0);
          hex.rotation.x = Math.PI / 2;
          group.add(hex);
        }
        scene.add(group);
        animatedObjects.push({
          update: (time) => {
            group.rotation.z = time * 0.15;
            group.rotation.y = Math.sin(time * 0.1) * 0.2;
          }
        });
        break;
      }

      case 'auroraWaveBands': {
        const group = new THREE.Group();
        const lineCount = 14;
        for (let l = 0; l < lineCount; l++) {
          const points = [];
          for (let x = -10; x <= 10; x += 0.5) {
            points.push(new THREE.Vector3(x, Math.sin(x * 0.4 + l) * 1.3, (l - lineCount / 2) * 0.5));
          }
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color: l % 2 === 0 ? 0x38bdf8 : 0x10b981, transparent: true, opacity: 0.35 });
          group.add(new THREE.Line(lineGeo, lineMat));
        }
        scene.add(group);
        animatedObjects.push({
          update: (time) => {
            group.rotation.y = Math.sin(time * 0.05) * 0.1;
          }
        });
        break;
      }

      case 'stellarConstellationGlobe': {
        const geo = new THREE.SphereGeometry(2.6, 14, 14);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.25 });
        const globe = new THREE.Mesh(geo, mat);
        globe.position.set(2.2, 0, -1);
        scene.add(globe);
        const dust = createAmbientDust(450, 0.038, 0x38bdf8);
        animatedObjects.push({
          update: (time) => {
            globe.rotation.y = time * 0.15;
            globe.rotation.x = time * 0.08;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'cyberGrid': {
        const gridHelper = new THREE.GridHelper(50, 40, 0x38bdf8, 0x0284c7);
        gridHelper.position.y = -3;
        gridHelper.rotation.x = 0.15;
        scene.add(gridHelper);
        const dust = createAmbientDust(450, 0.038, 0x10b981);
        animatedObjects.push({
          update: (time) => {
            gridHelper.position.z = (time * 0.6) % 1.25;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'dnaHelix': {
        const dnaGroup = new THREE.Group();
        dnaGroup.position.set(2.2, 0, -1);
        const strandCount = 45;
        const radius = 1.8;
        for (let i = 0; i < strandCount; i++) {
          const y = (i - strandCount / 2) * 0.28;
          const angle = i * 0.32;
          const x1 = Math.cos(angle) * radius;
          const z1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle + Math.PI) * radius;
          const z2 = Math.sin(angle + Math.PI) * radius;
          const p1Geo = new THREE.SphereGeometry(0.08, 6, 6);
          const p1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
          const p1 = new THREE.Mesh(p1Geo, p1Mat);
          p1.position.set(x1, y, z1);
          dnaGroup.add(p1);
          const p2Geo = new THREE.SphereGeometry(0.08, 6, 6);
          const p2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.75 });
          const p2 = new THREE.Mesh(p2Geo, p2Mat);
          p2.position.set(x2, y, z2);
          dnaGroup.add(p2);
          if (i % 2 === 0) {
            const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2)]);
            dnaGroup.add(new THREE.Line(lineGeo, lineMat));
          }
        }
        const dust = createAmbientDust(400, 0.038, 0x38bdf8);
        scene.add(dnaGroup);
        animatedObjects.push({
          update: (time) => {
            dnaGroup.rotation.y = time * 0.3;
            dnaGroup.rotation.z = Math.sin(time * 0.15) * 0.1;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'torusKnot': {
        const geo = new THREE.TorusKnotGeometry(2.1, 0.45, 100, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.28 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(2.2, 0, -1.5);
        scene.add(mesh);
        const dust = createAmbientDust(450, 0.038, 0x10b981);
        animatedObjects.push({
          update: (time) => {
            mesh.rotation.x = time * 0.2;
            mesh.rotation.y = time * 0.25;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'cosmicConstellation': {
        const nodeCount = 120;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(nodeCount * 3);
        const vel = [];
        for (let i = 0; i < nodeCount; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
          vel.push({ x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.008 });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.048, color: 0x38bdf8, transparent: true, opacity: 0.75 });
        const points = new THREE.Points(geo, mat);
        scene.add(points);
        animatedObjects.push({
          update: () => {
            const positions = points.geometry.attributes.position.array;
            for (let i = 0; i < nodeCount; i++) {
              positions[i * 3] += vel[i].x;
              positions[i * 3 + 1] += vel[i].y;
              positions[i * 3 + 2] += vel[i].z;
              if (Math.abs(positions[i * 3]) > 11) vel[i].x *= -1;
              if (Math.abs(positions[i * 3 + 1]) > 7) vel[i].y *= -1;
              if (Math.abs(positions[i * 3 + 2]) > 5) vel[i].z *= -1;
            }
            points.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'quantumWaves': {
        const cols = 50;
        const rows = 35;
        const count = cols * rows;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        let idx = 0;
        for (let ix = 0; ix < cols; ix++) {
          for (let iy = 0; iy < rows; iy++) {
            pos[idx] = (ix - cols / 2) * 0.45;
            pos[idx + 1] = 0;
            pos[idx + 2] = (iy - rows / 2) * 0.45;
            idx += 3;
          }
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.042, color: 0x38bdf8, transparent: true, opacity: 0.65 });
        const wavePoints = new THREE.Points(geo, mat);
        wavePoints.position.y = -2;
        scene.add(wavePoints);
        animatedObjects.push({
          update: (time) => {
            const positions = wavePoints.geometry.attributes.position.array;
            let i = 0;
            for (let ix = 0; ix < cols; ix++) {
              for (let iy = 0; iy < rows; iy++) {
                positions[i + 1] = Math.sin((ix + time * 5) * 0.2) * 0.45 + Math.sin((iy + time * 5) * 0.2) * 0.45;
                i += 3;
              }
            }
            wavePoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'matrixRain': {
        const count = 400;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 24;
          pos[i * 3 + 1] = Math.random() * 16 - 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
          speeds[i] = 0.04 + Math.random() * 0.06;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.048, color: 0x10b981, transparent: true, opacity: 0.75 });
        const rainPoints = new THREE.Points(geo, mat);
        scene.add(rainPoints);
        animatedObjects.push({
          update: () => {
            const positions = rainPoints.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] -= speeds[i];
              if (positions[i * 3 + 1] < -8) positions[i * 3 + 1] = 8;
            }
            rainPoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'hyperCube': {
        const outerGeo = new THREE.BoxGeometry(3, 3, 3);
        const outerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.28 });
        const outerBox = new THREE.Mesh(outerGeo, outerMat);
        const innerGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.4 });
        const innerBox = new THREE.Mesh(innerGeo, innerMat);
        const cubeGroup = new THREE.Group();
        cubeGroup.position.set(2.2, 0, -1);
        cubeGroup.add(outerBox);
        cubeGroup.add(innerBox);
        const dust = createAmbientDust(400, 0.038, 0x38bdf8);
        scene.add(cubeGroup);
        animatedObjects.push({
          update: (time) => {
            outerBox.rotation.x = time * 0.15;
            outerBox.rotation.y = time * 0.2;
            innerBox.rotation.x = -time * 0.25;
            innerBox.rotation.z = time * 0.2;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'galaxySwirl': {
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const r = Math.random() * 8 + 0.3;
          const theta = Math.random() * Math.PI * 2 + r * 1.1;
          pos[i * 3] = r * Math.cos(theta);
          pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
          pos[i * 3 + 2] = r * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.042, color: 0x38bdf8, transparent: true, opacity: 0.75 });
        const galaxy = new THREE.Points(geo, mat);
        galaxy.position.set(0, -0.5, -2);
        galaxy.rotation.x = 0.5;
        scene.add(galaxy);
        animatedObjects.push({
          update: (time) => {
            galaxy.rotation.y = time * 0.12;
          }
        });
        break;
      }

      case 'neonPlexus': {
        const cluster = new THREE.Group();
        cluster.position.set(2, 0, -1);
        for (let i = 0; i < 8; i++) {
          const geo = new THREE.OctahedronGeometry(0.8 + Math.random() * 0.4, 0);
          const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981, wireframe: true, transparent: true, opacity: 0.28 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5);
          cluster.add(mesh);
        }
        scene.add(cluster);
        animatedObjects.push({
          update: (time) => {
            cluster.rotation.y = time * 0.12;
            cluster.children.forEach((child, idx) => { child.rotation.x = time * (0.15 + idx * 0.03); });
          }
        });
        break;
      }

      case 'gyroscopeRings': {
        const ring1Geo = new THREE.TorusGeometry(3.1, 0.04, 16, 100);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        const ring2Geo = new THREE.TorusGeometry(2.3, 0.04, 16, 100);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        const gyroGroup = new THREE.Group();
        gyroGroup.position.set(2.2, 0, -1.5);
        gyroGroup.add(ring1);
        gyroGroup.add(ring2);
        scene.add(gyroGroup);
        const dust = createAmbientDust(400, 0.038, 0x38bdf8);
        animatedObjects.push({
          update: (time) => {
            ring1.rotation.x = time * 0.3;
            ring1.rotation.y = time * 0.15;
            ring2.rotation.y = time * 0.4;
            ring2.rotation.z = time * 0.2;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'particleCore': {
        const coreGeo = new THREE.SphereGeometry(1.6, 18, 18);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.28 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(2.2, 0, -1);
        const pCount = 450;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 3 + Math.random() * 7;
          pPos[i] = r * Math.sin(phi) * Math.cos(theta);
          pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
          pPos[i + 2] = r * Math.cos(phi);
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.042, color: 0x10b981, transparent: true, opacity: 0.65 });
        const particles = new THREE.Points(pGeo, pMat);
        const coreGroup = new THREE.Group();
        coreGroup.add(core);
        coreGroup.add(particles);
        scene.add(coreGroup);
        animatedObjects.push({
          update: (time) => {
            core.rotation.y = time * 0.2;
            particles.rotation.y = -time * 0.1;
            const scale = 1 + Math.sin(time * 1.5) * 0.05;
            core.scale.set(scale, scale, scale);
          }
        });
        break;
      }

      case 'warpSpeed': {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 26;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 2] = Math.random() * -30;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x38bdf8, transparent: true, opacity: 0.75 });
        const warpField = new THREE.Points(geo, mat);
        scene.add(warpField);
        animatedObjects.push({
          update: () => {
            const positions = warpField.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 2] += 0.18;
              if (positions[i * 3 + 2] > 5) positions[i * 3 + 2] = -30;
            }
            warpField.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'circuitGrid': {
        const circuitGroup = new THREE.Group();
        const linesMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.32 });
        for (let i = 0; i < 24; i++) {
          const points = [];
          let startX = (Math.random() - 0.5) * 18;
          let startY = (Math.random() - 0.5) * 12;
          points.push(new THREE.Vector3(startX, startY, 0));
          for (let step = 0; step < 4; step++) {
            if (step % 2 === 0) startX += (Math.random() - 0.5) * 3;
            else startY += (Math.random() - 0.5) * 3;
            points.push(new THREE.Vector3(startX, startY, 0));
          }
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          circuitGroup.add(new THREE.Line(lineGeo, linesMat));
        }
        scene.add(circuitGroup);
        animatedObjects.push({
          update: (time) => {
            circuitGroup.rotation.z = Math.sin(time * 0.06) * 0.04;
          }
        });
        break;
      }

      case 'crystalOctahedrons': {
        const crystalGroup = new THREE.Group();
        crystalGroup.position.set(2, 0, -1);
        for (let i = 0; i < 12; i++) {
          const geo = new THREE.OctahedronGeometry(0.7 + Math.random() * 0.4, 0);
          const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981, wireframe: true, transparent: true, opacity: 0.28 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 7);
          crystalGroup.add(mesh);
        }
        scene.add(crystalGroup);
        animatedObjects.push({
          update: (time) => {
            crystalGroup.children.forEach((c, idx) => {
              c.rotation.x = time * (0.2 + idx * 0.03);
              c.rotation.y = time * (0.15 + idx * 0.03);
              c.position.y += Math.sin(time * 1.5 + idx) * 0.002;
            });
          }
        });
        break;
      }

      // Default: PRESET #1 GLOWING TECH SPHERE (VIBRANT GLOW)
      default:
      case 'icosahedron': {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
          posArray[i] = (Math.random() - 0.5) * 26;
          posArray[i + 1] = (Math.random() - 0.5) * 16;
          posArray[i + 2] = (Math.random() - 0.5) * 14;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 0.04, color: 0x38bdf8, transparent: true, opacity: 0.65 });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        const geometry = new THREE.IcosahedronGeometry(2.3, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.28 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(2.2, 0, -1);
        scene.add(sphere);

        animatedObjects.push({
          update: (time) => {
            particlesMesh.rotation.y = time * 0.03;
            particlesMesh.rotation.x = time * 0.015;
            sphere.rotation.x = time * 0.12;
            sphere.rotation.y = time * 0.15;
          }
        });
        break;
      }
    }

    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (interactive) {
        camera.position.x += (mouseX - camera.position.x) * 0.04;
        camera.position.y += (-mouseY - camera.position.y) * 0.04;
      }

      animatedObjects.forEach(obj => obj.update(elapsedTime));

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentPreset, interactive]);

  return <div ref={mountRef} className={className} />;
}

export default ThreeCanvas;
