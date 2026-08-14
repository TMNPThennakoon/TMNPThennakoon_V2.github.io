import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const THREE_PRESETS = [
  { id: 'icosahedron', name: '1. Glowing Tech Sphere & Screen Dust' },
  { id: 'cyberGrid', name: '2. 3D Cyber Perspective Grid' },
  { id: 'dnaHelix', name: '3. Rotating 3D DNA & Particle Lattice' },
  { id: 'torusKnot', name: '4. Metallic Torus Knot & Star Field' },
  { id: 'cosmicConstellation', name: '5. Cosmic Star Constellation Net' },
  { id: 'quantumWaves', name: '6. Quantum Sine Particle Wave' },
  { id: 'matrixRain', name: '7. 3D Digital Code Stream' },
  { id: 'hyperCube', name: '8. 4D Tesseract HyperCube' },
  { id: 'galaxySwirl', name: '9. Full Screen Spiral Galaxy Vortex' },
  { id: 'neonPlexus', name: '10. Connected Wide Neon Plexus' },
  { id: 'gyroscopeRings', name: '11. Dual Gyroscope Automation Rings' },
  { id: 'particleCore', name: '12. Pulsating Core & Cosmic Dust' },
  { id: 'warpSpeed', name: '13. Hyperspace Wide Star Tunnel' },
  { id: 'circuitGrid', name: '14. 3D Electronic Circuit Microchip Grid' },
  { id: 'crystalOctahedrons', name: '15. Floating Crystal Octahedron Clusters' },
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
      mouseX = (e.clientX / width - 0.5) * 0.8;
      mouseY = (e.clientY / height - 0.5) * 0.8;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    camera.position.z = 5;

    // --- PRESET CREATION LOGIC WITH FULL SCREEN SPREAD ---
    switch (currentPreset) {
      case 'cyberGrid': {
        const gridHelper = new THREE.GridHelper(50, 40, 0x38bdf8, 0x1e293b);
        gridHelper.position.y = -2.5;
        gridHelper.rotation.x = 0.2;
        scene.add(gridHelper);

        const particlesGeo = new THREE.BufferGeometry();
        const pCount = 500;
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          pPos[i] = (Math.random() - 0.5) * 26;
          pPos[i + 1] = Math.random() * 12 - 4;
          pPos[i + 2] = (Math.random() - 0.5) * 26;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0x10b981, transparent: true, opacity: 0.7 });
        const particlePoints = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particlePoints);

        animatedObjects.push({
          update: (time) => {
            gridHelper.position.z = (time * 0.8) % 1.25;
            particlePoints.rotation.y = time * 0.04;
          }
        });
        break;
      }

      case 'dnaHelix': {
        const dnaGroup = new THREE.Group();
        const strandCount = 50;
        const radius = 2.2;

        for (let i = 0; i < strandCount; i++) {
          const y = (i - strandCount / 2) * 0.3;
          const angle = i * 0.35;

          const x1 = Math.cos(angle) * radius;
          const z1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle + Math.PI) * radius;
          const z2 = Math.sin(angle + Math.PI) * radius;

          const p1Geo = new THREE.SphereGeometry(0.1, 8, 8);
          const p1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const p1 = new THREE.Mesh(p1Geo, p1Mat);
          p1.position.set(x1, y, z1);
          dnaGroup.add(p1);

          const p2Geo = new THREE.SphereGeometry(0.1, 8, 8);
          const p2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const p2 = new THREE.Mesh(p2Geo, p2Mat);
          p2.position.set(x2, y, z2);
          dnaGroup.add(p2);

          if (i % 2 === 0) {
            const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y, z1),
              new THREE.Vector3(x2, y, z2)
            ]);
            const line = new THREE.Line(lineGeo, lineMat);
            dnaGroup.add(line);
          }
        }

        // Add ambient full screen dust
        const dustCount = 300;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i += 3) {
          dustPos[i] = (Math.random() - 0.5) * 24;
          dustPos[i + 1] = (Math.random() - 0.5) * 16;
          dustPos[i + 2] = (Math.random() - 0.5) * 15;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({ size: 0.04, color: 0x06b6d4, transparent: true, opacity: 0.6 });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        scene.add(dnaGroup);
        animatedObjects.push({
          update: (time) => {
            dnaGroup.rotation.y = time * 0.35;
            dnaGroup.rotation.z = Math.sin(time * 0.2) * 0.15;
            dust.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'torusKnot': {
        const geo = new THREE.TorusKnotGeometry(2.2, 0.6, 120, 20);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Ambient wide particle dust
        const pCount = 400;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          pPos[i] = (Math.random() - 0.5) * 25;
          pPos[i + 1] = (Math.random() - 0.5) * 16;
          pPos[i + 2] = (Math.random() - 0.5) * 15;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x10b981, transparent: true, opacity: 0.5 });
        const dust = new THREE.Points(pGeo, pMat);
        scene.add(dust);

        animatedObjects.push({
          update: (time) => {
            mesh.rotation.x = time * 0.25;
            mesh.rotation.y = time * 0.35;
            dust.rotation.y = time * 0.03;
          }
        });
        break;
      }

      case 'cosmicConstellation': {
        const nodeCount = 140;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(nodeCount * 3);
        const vel = [];

        for (let i = 0; i < nodeCount; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
          vel.push({
            x: (Math.random() - 0.5) * 0.012,
            y: (Math.random() - 0.5) * 0.012,
            z: (Math.random() - 0.5) * 0.012
          });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.09, color: 0x38bdf8 });
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
        const cols = 60;
        const rows = 40;
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
        const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x06b6d4 });
        const wavePoints = new THREE.Points(geo, mat);
        wavePoints.position.y = -1.5;
        scene.add(wavePoints);

        animatedObjects.push({
          update: (time) => {
            const positions = wavePoints.geometry.attributes.position.array;
            let i = 0;
            for (let ix = 0; ix < cols; ix++) {
              for (let iy = 0; iy < rows; iy++) {
                positions[i + 1] = Math.sin((ix + time * 6) * 0.25) * 0.6 + Math.sin((iy + time * 6) * 0.25) * 0.6;
                i += 3;
              }
            }
            wavePoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'matrixRain': {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 24;
          pos[i * 3 + 1] = Math.random() * 16 - 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
          speeds[i] = 0.06 + Math.random() * 0.09;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.07, color: 0x10b981, transparent: true, opacity: 0.8 });
        const rainPoints = new THREE.Points(geo, mat);
        scene.add(rainPoints);

        animatedObjects.push({
          update: () => {
            const positions = rainPoints.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] -= speeds[i];
              if (positions[i * 3 + 1] < -8) {
                positions[i * 3 + 1] = 8;
              }
            }
            rainPoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'hyperCube': {
        const outerGeo = new THREE.BoxGeometry(3.5, 3.5, 3.5);
        const outerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
        const outerBox = new THREE.Mesh(outerGeo, outerMat);

        const innerGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.5 });
        const innerBox = new THREE.Mesh(innerGeo, innerMat);

        const cubeGroup = new THREE.Group();
        cubeGroup.add(outerBox);
        cubeGroup.add(innerBox);

        // Screen particles
        const pCount = 300;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          pPos[i] = (Math.random() - 0.5) * 24;
          pPos[i + 1] = (Math.random() - 0.5) * 16;
          pPos[i + 2] = (Math.random() - 0.5) * 14;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x38bdf8, transparent: true, opacity: 0.5 });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        scene.add(cubeGroup);
        animatedObjects.push({
          update: (time) => {
            outerBox.rotation.x = time * 0.2;
            outerBox.rotation.y = time * 0.25;
            innerBox.rotation.x = -time * 0.35;
            innerBox.rotation.z = time * 0.3;
            particles.rotation.y = time * 0.02;
          }
        });
        break;
      }

      case 'galaxySwirl': {
        const count = 700;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          const r = Math.random() * 9 + 0.3;
          const theta = Math.random() * Math.PI * 2 + r * 1.2;
          pos[i * 3] = r * Math.cos(theta);
          pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
          pos[i * 3 + 2] = r * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.06, color: 0x38bdf8, transparent: true, opacity: 0.8 });
        const galaxy = new THREE.Points(geo, mat);
        galaxy.rotation.x = 0.6;
        scene.add(galaxy);

        animatedObjects.push({
          update: (time) => {
            galaxy.rotation.y = time * 0.18;
          }
        });
        break;
      }

      case 'neonPlexus': {
        const cluster = new THREE.Group();
        for (let i = 0; i < 10; i++) {
          const geo = new THREE.OctahedronGeometry(1 + Math.random() * 0.6, 0);
          const mat = new THREE.MeshBasicMaterial({ 
            color: i % 2 === 0 ? 0x06b6d4 : 0x10b981, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.45 
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
          cluster.add(mesh);
        }
        scene.add(cluster);

        animatedObjects.push({
          update: (time) => {
            cluster.rotation.y = time * 0.15;
            cluster.children.forEach((child, idx) => {
              child.rotation.x = time * (0.2 + idx * 0.04);
            });
          }
        });
        break;
      }

      case 'gyroscopeRings': {
        const ring1Geo = new THREE.TorusGeometry(3.2, 0.04, 16, 120);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);

        const ring2Geo = new THREE.TorusGeometry(2.4, 0.04, 16, 120);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);

        const ring3Geo = new THREE.TorusGeometry(1.6, 0.04, 16, 120);
        const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);

        const gyroGroup = new THREE.Group();
        gyroGroup.add(ring1);
        gyroGroup.add(ring2);
        gyroGroup.add(ring3);
        scene.add(gyroGroup);

        animatedObjects.push({
          update: (time) => {
            ring1.rotation.x = time * 0.4;
            ring1.rotation.y = time * 0.2;
            ring2.rotation.y = time * 0.5;
            ring2.rotation.z = time * 0.3;
            ring3.rotation.x = -time * 0.6;
          }
        });
        break;
      }

      case 'particleCore': {
        const coreGeo = new THREE.SphereGeometry(1.8, 20, 20);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.4 });
        const core = new THREE.Mesh(coreGeo, coreMat);

        const pCount = 500;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 3 + Math.random() * 8;
          pPos[i] = r * Math.sin(phi) * Math.cos(theta);
          pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
          pPos[i + 2] = r * Math.cos(phi);
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0x10b981, transparent: true, opacity: 0.7 });
        const particles = new THREE.Points(pGeo, pMat);

        const coreGroup = new THREE.Group();
        coreGroup.add(core);
        coreGroup.add(particles);
        scene.add(coreGroup);

        animatedObjects.push({
          update: (time) => {
            core.rotation.y = time * 0.3;
            particles.rotation.y = -time * 0.15;
            const scale = 1 + Math.sin(time * 2) * 0.08;
            core.scale.set(scale, scale, scale);
          }
        });
        break;
      }

      case 'warpSpeed': {
        const count = 600;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 26;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 2] = Math.random() * -30;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.07, color: 0x38bdf8 });
        const warpField = new THREE.Points(geo, mat);
        scene.add(warpField);

        animatedObjects.push({
          update: () => {
            const positions = warpField.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 2] += 0.3;
              if (positions[i * 3 + 2] > 5) {
                positions[i * 3 + 2] = -30;
              }
            }
            warpField.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'circuitGrid': {
        const circuitGroup = new THREE.Group();
        const linesMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.45 });
        
        for (let i = 0; i < 25; i++) {
          const points = [];
          let startX = (Math.random() - 0.5) * 18;
          let startY = (Math.random() - 0.5) * 12;
          points.push(new THREE.Vector3(startX, startY, 0));
          
          for (let step = 0; step < 5; step++) {
            if (step % 2 === 0) startX += (Math.random() - 0.5) * 3;
            else startY += (Math.random() - 0.5) * 3;
            points.push(new THREE.Vector3(startX, startY, 0));
          }

          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, linesMat);
          circuitGroup.add(line);
        }
        scene.add(circuitGroup);

        animatedObjects.push({
          update: (time) => {
            circuitGroup.rotation.z = Math.sin(time * 0.08) * 0.06;
          }
        });
        break;
      }

      case 'crystalOctahedrons': {
        const crystalGroup = new THREE.Group();
        for (let i = 0; i < 14; i++) {
          const geo = new THREE.OctahedronGeometry(0.7 + Math.random() * 0.5, 0);
          const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981, wireframe: true, transparent: true, opacity: 0.5 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
          crystalGroup.add(mesh);
        }
        scene.add(crystalGroup);

        animatedObjects.push({
          update: (time) => {
            crystalGroup.children.forEach((c, idx) => {
              c.rotation.x = time * (0.3 + idx * 0.03);
              c.rotation.y = time * (0.2 + idx * 0.03);
              c.position.y += Math.sin(time * 2 + idx) * 0.003;
            });
          }
        });
        break;
      }

      // Default: Icosahedron Sphere + Full Screen Dust
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

        const geometry = new THREE.IcosahedronGeometry(2.5, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.2 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        animatedObjects.push({
          update: (time) => {
            particlesMesh.rotation.y = time * 0.04;
            particlesMesh.rotation.x = time * 0.02;
            sphere.rotation.x = time * 0.15;
            sphere.rotation.y = time * 0.2;
          }
        });
        break;
      }
    }

    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (interactive) {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
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
