import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const THREE_PRESETS = [
  { id: 'icosahedron', name: '1. Glowing Icosahedron Sphere' },
  { id: 'cyberGrid', name: '2. 3D Cyber Perspective Grid' },
  { id: 'dnaHelix', name: '3. Rotating 3D DNA Lattice' },
  { id: 'torusKnot', name: '4. Metallic Torus Knot' },
  { id: 'cosmicConstellation', name: '5. Cosmic Star Constellation' },
  { id: 'quantumWaves', name: '6. Quantum Sine Particle Wave' },
  { id: 'matrixRain', name: '7. 3D Digital Code Stream' },
  { id: 'hyperCube', name: '8. 4D Tesseract HyperCube' },
  { id: 'galaxySwirl', name: '9. Spiral Galaxy Vortex' },
  { id: 'neonPlexus', name: '10. Connected Neon Plexus' },
  { id: 'gyroscopeRings', name: '11. Dual Gyroscope Rings' },
  { id: 'particleCore', name: '12. Pulsating Energy Core' },
  { id: 'warpSpeed', name: '13. Hyperspace Star Tunnel' },
  { id: 'circuitGrid', name: '14. 3D Electronic Circuit Grid' },
  { id: 'crystalOctahedrons', name: '15. Floating Crystal Octahedrons' },
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

    // Dimensions
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear previous canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Objects to cleanup
    const animatedObjects = [];
    let animationFrameId = null;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseX = (e.clientX / width - 0.5) * 0.5;
      mouseY = (e.clientY / height - 0.5) * 0.5;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    camera.position.z = 5;

    // --- PRESET CREATION LOGIC ---
    switch (currentPreset) {
      case 'cyberGrid': {
        const gridHelper = new THREE.GridHelper(30, 30, 0x38bdf8, 0x1e293b);
        gridHelper.position.y = -2;
        gridHelper.rotation.x = 0.2;
        scene.add(gridHelper);

        const particlesGeo = new THREE.BufferGeometry();
        const pCount = 300;
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          pPos[i] = (Math.random() - 0.5) * 20;
          pPos[i + 1] = Math.random() * 8 - 2;
          pPos[i + 2] = (Math.random() - 0.5) * 20;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const particlesMat = new THREE.PointsMaterial({ size: 0.04, color: 0x10b981, transparent: true, opacity: 0.7 });
        const particlePoints = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particlePoints);

        animatedObjects.push({
          update: (time) => {
            gridHelper.position.z = (time * 0.5) % 1;
            particlePoints.rotation.y = time * 0.05;
          }
        });
        break;
      }

      case 'dnaHelix': {
        const dnaGroup = new THREE.Group();
        const strandCount = 40;
        const radius = 1.5;

        for (let i = 0; i < strandCount; i++) {
          const y = (i - strandCount / 2) * 0.25;
          const angle = i * 0.3;

          const x1 = Math.cos(angle) * radius;
          const z1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle + Math.PI) * radius;
          const z2 = Math.sin(angle + Math.PI) * radius;

          const p1Geo = new THREE.SphereGeometry(0.08, 8, 8);
          const p1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const p1 = new THREE.Mesh(p1Geo, p1Mat);
          p1.position.set(x1, y, z1);
          dnaGroup.add(p1);

          const p2Geo = new THREE.SphereGeometry(0.08, 8, 8);
          const p2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const p2 = new THREE.Mesh(p2Geo, p2Mat);
          p2.position.set(x2, y, z2);
          dnaGroup.add(p2);

          if (i % 2 === 0) {
            const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y, z1),
              new THREE.Vector3(x2, y, z2)
            ]);
            const line = new THREE.Line(lineGeo, lineMat);
            dnaGroup.add(line);
          }
        }
        scene.add(dnaGroup);
        animatedObjects.push({
          update: (time) => {
            dnaGroup.rotation.y = time * 0.4;
            dnaGroup.rotation.z = Math.sin(time * 0.2) * 0.1;
          }
        });
        break;
      }

      case 'torusKnot': {
        const geo = new THREE.TorusKnotGeometry(1.6, 0.45, 100, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        animatedObjects.push({
          update: (time) => {
            mesh.rotation.x = time * 0.3;
            mesh.rotation.y = time * 0.4;
          }
        });
        break;
      }

      case 'cosmicConstellation': {
        const nodeCount = 80;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(nodeCount * 3);
        const vel = [];

        for (let i = 0; i < nodeCount; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 12;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
          vel.push({
            x: (Math.random() - 0.5) * 0.008,
            y: (Math.random() - 0.5) * 0.008,
            z: (Math.random() - 0.5) * 0.008
          });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.08, color: 0x38bdf8 });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        animatedObjects.push({
          update: () => {
            const positions = points.geometry.attributes.position.array;
            for (let i = 0; i < nodeCount; i++) {
              positions[i * 3] += vel[i].x;
              positions[i * 3 + 1] += vel[i].y;
              positions[i * 3 + 2] += vel[i].z;

              if (Math.abs(positions[i * 3]) > 6) vel[i].x *= -1;
              if (Math.abs(positions[i * 3 + 1]) > 4) vel[i].y *= -1;
              if (Math.abs(positions[i * 3 + 2]) > 3) vel[i].z *= -1;
            }
            points.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'quantumWaves': {
        const cols = 40;
        const rows = 40;
        const count = cols * rows;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);

        let idx = 0;
        for (let ix = 0; ix < cols; ix++) {
          for (let iy = 0; iy < rows; iy++) {
            pos[idx] = (ix - cols / 2) * 0.35;
            pos[idx + 1] = 0;
            pos[idx + 2] = (iy - rows / 2) * 0.35;
            idx += 3;
          }
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x06b6d4 });
        const wavePoints = new THREE.Points(geo, mat);
        wavePoints.position.y = -1;
        scene.add(wavePoints);

        animatedObjects.push({
          update: (time) => {
            const positions = wavePoints.geometry.attributes.position.array;
            let i = 0;
            for (let ix = 0; ix < cols; ix++) {
              for (let iy = 0; iy < rows; iy++) {
                positions[i + 1] = Math.sin((ix + time * 5) * 0.3) * 0.4 + Math.sin((iy + time * 5) * 0.3) * 0.4;
                i += 3;
              }
            }
            wavePoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'matrixRain': {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 14;
          pos[i * 3 + 1] = Math.random() * 10 - 5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
          speeds[i] = 0.05 + Math.random() * 0.08;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.06, color: 0x10b981, transparent: true, opacity: 0.8 });
        const rainPoints = new THREE.Points(geo, mat);
        scene.add(rainPoints);

        animatedObjects.push({
          update: () => {
            const positions = rainPoints.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 1] -= speeds[i];
              if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = 5;
              }
            }
            rainPoints.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'hyperCube': {
        const outerGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
        const outerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.4 });
        const outerBox = new THREE.Mesh(outerGeo, outerMat);

        const innerGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.6 });
        const innerBox = new THREE.Mesh(innerGeo, innerMat);

        const cubeGroup = new THREE.Group();
        cubeGroup.add(outerBox);
        cubeGroup.add(innerBox);
        scene.add(cubeGroup);

        animatedObjects.push({
          update: (time) => {
            outerBox.rotation.x = time * 0.2;
            outerBox.rotation.y = time * 0.3;
            innerBox.rotation.x = -time * 0.4;
            innerBox.rotation.z = time * 0.3;
          }
        });
        break;
      }

      case 'galaxySwirl': {
        const count = 400;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          const r = Math.random() * 5 + 0.2;
          const theta = Math.random() * Math.PI * 2 + r * 1.5;
          pos[i * 3] = r * Math.cos(theta);
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
          pos[i * 3 + 2] = r * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x38bdf8, transparent: true, opacity: 0.8 });
        const galaxy = new THREE.Points(geo, mat);
        galaxy.rotation.x = 0.5;
        scene.add(galaxy);

        animatedObjects.push({
          update: (time) => {
            galaxy.rotation.y = time * 0.15;
          }
        });
        break;
      }

      case 'neonPlexus': {
        const cluster = new THREE.Group();
        for (let i = 0; i < 6; i++) {
          const geo = new THREE.OctahedronGeometry(0.8 + Math.random() * 0.5, 0);
          const mat = new THREE.MeshBasicMaterial({ 
            color: i % 2 === 0 ? 0x06b6d4 : 0x10b981, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.4 
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
          cluster.add(mesh);
        }
        scene.add(cluster);

        animatedObjects.push({
          update: (time) => {
            cluster.rotation.y = time * 0.2;
            cluster.children.forEach((child, idx) => {
              child.rotation.x = time * (0.2 + idx * 0.05);
            });
          }
        });
        break;
      }

      case 'gyroscopeRings': {
        const ring1Geo = new THREE.TorusGeometry(2, 0.03, 16, 100);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);

        const ring2Geo = new THREE.TorusGeometry(1.5, 0.03, 16, 100);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);

        const gyroGroup = new THREE.Group();
        gyroGroup.add(ring1);
        gyroGroup.add(ring2);
        scene.add(gyroGroup);

        animatedObjects.push({
          update: (time) => {
            ring1.rotation.x = time * 0.5;
            ring1.rotation.y = time * 0.2;
            ring2.rotation.y = time * 0.6;
            ring2.rotation.z = time * 0.3;
          }
        });
        break;
      }

      case 'particleCore': {
        const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.5 });
        const core = new THREE.Mesh(coreGeo, coreMat);

        const pCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 2.2 + Math.random() * 0.5;
          pPos[i] = r * Math.sin(phi) * Math.cos(theta);
          pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
          pPos[i + 2] = r * Math.cos(phi);
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.04, color: 0x10b981 });
        const particles = new THREE.Points(pGeo, pMat);

        const coreGroup = new THREE.Group();
        coreGroup.add(core);
        coreGroup.add(particles);
        scene.add(coreGroup);

        animatedObjects.push({
          update: (time) => {
            core.rotation.y = time * 0.3;
            particles.rotation.y = -time * 0.2;
            const scale = 1 + Math.sin(time * 2) * 0.08;
            coreGroup.scale.set(scale, scale, scale);
          }
        });
        break;
      }

      case 'warpSpeed': {
        const count = 400;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 16;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
          pos[i * 3 + 2] = Math.random() * -20;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x38bdf8 });
        const warpField = new THREE.Points(geo, mat);
        scene.add(warpField);

        animatedObjects.push({
          update: () => {
            const positions = warpField.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
              positions[i * 3 + 2] += 0.2;
              if (positions[i * 3 + 2] > 5) {
                positions[i * 3 + 2] = -20;
              }
            }
            warpField.geometry.attributes.position.needsUpdate = true;
          }
        });
        break;
      }

      case 'circuitGrid': {
        const circuitGroup = new THREE.Group();
        const linesMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
        
        for (let i = 0; i < 15; i++) {
          const points = [];
          let startX = (Math.random() - 0.5) * 8;
          let startY = (Math.random() - 0.5) * 6;
          points.push(new THREE.Vector3(startX, startY, 0));
          
          for (let step = 0; step < 4; step++) {
            if (step % 2 === 0) startX += (Math.random() - 0.5) * 2;
            else startY += (Math.random() - 0.5) * 2;
            points.push(new THREE.Vector3(startX, startY, 0));
          }

          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, linesMat);
          circuitGroup.add(line);
        }
        scene.add(circuitGroup);

        animatedObjects.push({
          update: (time) => {
            circuitGroup.rotation.z = Math.sin(time * 0.1) * 0.05;
          }
        });
        break;
      }

      case 'crystalOctahedrons': {
        const crystalGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
          const geo = new THREE.OctahedronGeometry(0.5 + Math.random() * 0.4, 0);
          const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981, wireframe: true, transparent: true, opacity: 0.5 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4);
          crystalGroup.add(mesh);
        }
        scene.add(crystalGroup);

        animatedObjects.push({
          update: (time) => {
            crystalGroup.children.forEach((c, idx) => {
              c.rotation.x = time * (0.3 + idx * 0.05);
              c.rotation.y = time * (0.2 + idx * 0.05);
              c.position.y += Math.sin(time * 2 + idx) * 0.002;
            });
          }
        });
        break;
      }

      // Default: Icosahedron Sphere
      default:
      case 'icosahedron': {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 15;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({ size: 0.03, color: 0x38bdf8, transparent: true, opacity: 0.6 });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        const geometry = new THREE.IcosahedronGeometry(2, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.15 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        animatedObjects.push({
          update: () => {
            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;
            sphere.rotation.x += 0.002;
            sphere.rotation.y += 0.003;
          }
        });
        break;
      }
    }

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Camera mouse lag
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
