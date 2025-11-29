import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMysql,
  SiArduino,
  SiRaspberrypi,
  SiFlutter,
  SiAndroid,
} from 'react-icons/si';
import { 
  FaCogs, 
  FaMicrochip, 
  FaWifi, 
  FaCube, 
  FaCode,
  FaMobileAlt,
  FaGlobe,
} from 'react-icons/fa';
import * as THREE from 'three';
import { getPortfolioData } from '../utils/portfolioData';

function Profile() {
  const threeRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isInView, setIsInView] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const profile = portfolioData.profile;
  const wordsToAnimate = profile.typingWords || ['Engineering Technology Student', 'Web Developer', 'UI/UX Designer'];

  useEffect(() => {
    const handleUpdate = (event) => {
      setPortfolioData(event.detail);
    };
    
    window.addEventListener('portfolioDataUpdated', handleUpdate);
    
    const handleStorage = (e) => {
      if (e.key === 'portfolioData' && e.newValue) {
        try {
          setPortfolioData(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    
    const handleCustomStorage = (e) => {
      if (e.detail && e.detail.key === 'portfolioData' && e.detail.newValue) {
        try {
          setPortfolioData(JSON.parse(e.detail.newValue));
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    };
    window.addEventListener('portfolioStorageUpdate', handleCustomStorage);
    
    const checkForUpdates = () => {
      const latest = getPortfolioData();
      setPortfolioData(latest);
    };
    checkForUpdates();
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('portfolioStorageUpdate', handleCustomStorage);
    };
  }, []);

  // Track section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);

  // Typing animation
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % wordsToAnimate.length;
      const fullText = wordsToAnimate[i];
      const speed = isDeleting ? 80 : Math.random() * 100 + 100;

      setTypingSpeed(speed);
      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum((n) => n + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, wordsToAnimate]);

  // --- 3D Background (Three.js) ---
  useEffect(() => {
    const mount = threeRef.current;
    const host = containerRef.current;
    if (!mount || !host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03111a, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      host.clientWidth / host.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 80);

    const light = new THREE.DirectionalLight(0x88ccff, 0.8);
    light.position.set(5, 10, 7);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x226677, 0.6));

    const particleCount = 2200;
    const radius = 120;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color('#4fd1c5');
    const colorB = new THREE.Color('#60a5fa');

    for (let i = 0; i < particleCount; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const t = Math.random();
      const c = colorA.clone().lerp(colorB, t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      }

    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    const poly = new THREE.Mesh(
      new THREE.IcosahedronGeometry(18, 1),
      new THREE.MeshPhysicalMaterial({
        color: 0x8ec5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    scene.add(poly);

    let mouseX = 0,
      mouseY = 0;

    const onMouseMove = (e) => {
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    host.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onResize);

    let start = performance.now();
    let raf;

    const animate = (t) => {
      const elapsed = (t - start) * 0.001;

      camera.position.x += (mouseX * 30 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 20 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      const pos = pGeom.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const dx = Math.sin(elapsed * 0.2 + ix) * 0.02;
        const dy = Math.cos(elapsed * 0.25 + iy) * 0.02;
        const dz = Math.sin(elapsed * 0.22 + iz) * 0.02;

        pos.array[ix] += dx;
        pos.array[iy] += dy;
        pos.array[iz] += dz;
      }
      pos.needsUpdate = true;

      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0003;

      poly.rotation.x += 0.0007;
      poly.rotation.y -= 0.001;

      const pulse = 0.25 + Math.sin(elapsed * 0.8) * 0.08;
      poly.material.opacity = pulse;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      host.removeEventListener('mousemove', onMouseMove);
      mount.removeChild(renderer.domElement);
      pGeom.dispose();
      pMat.dispose();
      poly.geometry.dispose();
      poly.material.dispose();
      renderer.dispose();
    };
  }, []);

  // 3D tilt on profile image with smooth live tracking
  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let raf;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 20;
      targetY = -y * 20;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      // Smooth interpolation for fluid motion
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      const scale = targetX !== 0 || targetY !== 0 ? 1.05 : 1;
      element.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg) scale3d(${scale},${scale},${scale})`;

      raf = requestAnimationFrame(animate);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="profile"
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden py-20 px-4 sm:px-6"
      ref={containerRef}
    >
      <div ref={threeRef} className="absolute inset-0 z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% 10%, rgba(99, 179, 237, 0.15), transparent 60%), radial-gradient(1000px 500px at 90% 90%, rgba(45, 212, 191, 0.12), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-7xl mx-auto" ref={contentRef}>
        {/* Profile Image - keeping the original structure with custom animation */}
        <div
          ref={imageRef}
          className="relative group transition-transform duration-300 ease-out"
          style={{ animation: 'fadeInSmooth 1.2s ease-out', transformStyle: 'preserve-3d' }}
        >
          <img
            src={profile.profileImage}
            alt={profile.name}
            className="w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full border-8 border-white/20 object-cover shadow-2xl transition-all duration-700"
          />
        </div>

        <div className="text-center lg:text-left space-y-6 max-w-2xl">
          {/* Name with animation */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent pb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {profile.name}
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto lg:mx-0"
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Typing animation title */}
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ minHeight: '90px' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {text}
            </span>
            <span className="blinking-cursor" />
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg sm:text-xl text-gray-300"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {profile.description}
          </motion.p>

          <motion.p
            className="text-base sm:text-lg text-gray-500 italic"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {profile.education}
          </motion.p>

          {/* Skills */}
          <motion.div
            className="flex justify-center lg:justify-start items-center gap-6 pt-4 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-md font-semibold tracking-wider w-full lg:w-auto mb-2 lg:mb-0 text-gray-400">
              Skills:
            </span>
            {[
              { Icon: FaCogs, label: 'PLC', color: '#4A90E2' },
              { Icon: FaCube, label: 'CAD Design', color: '#FF6B35' },
              { Icon: FaWifi, label: 'IoT Development', color: '#00D4AA' },
              { Icon: FaGlobe, label: 'Web Development', color: '#61DAFB' },
              { Icon: FaMobileAlt, label: 'App Development', color: '#34A853' },
              { Icon: SiReact, label: 'React', color: '#61DAFB' },
              { Icon: SiNodedotjs, label: 'Node.js', color: '#339933' },
              { Icon: SiFlutter, label: 'Flutter', color: '#02569B' },
              { Icon: SiArduino, label: 'Arduino', color: '#00979D' },
              { Icon: SiRaspberrypi, label: 'Raspberry Pi', color: '#C51A4A' },
              { Icon: FaMicrochip, label: 'Embedded Systems', color: '#FF6B6B' },
              { Icon: FaCode, label: 'Programming', color: '#4ECDC4' },
            ].map(({ Icon, label, color }, idx) => (
              <motion.span
                key={label}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10 shadow-sm transition hover:scale-110 hover:bg-white/10"
                title={label}
                aria-label={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.5,
                  delay: isInView ? 1.1 + idx * 0.05 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ scale: 1.15, rotate: 5 }}
              >
                <Icon 
                  className="h-6 w-6 opacity-70 filter grayscale transition hover:opacity-100 hover:grayscale-0" 
                  style={{ color: color || 'currentColor' }}
                />
              </motion.span>
            ))}
          </motion.div>

          {/* Social / CTAs with zoom effect */}
          <motion.div
            className="flex justify-center lg:justify-start items-center gap-4 pt-8 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {[
              {
                label: 'GitHub',
                href: profile.socialLinks.github,
                external: true,
              },
              {
                label: 'LinkedIn',
                href: profile.socialLinks.linkedin,
                external: true,
              },
              {
                label: 'Download CV',
                href: profile.socialLinks.cv,
                download: 'CV.pdf',
              },
              { label: 'Email', href: `mailto:${profile.socialLinks.email}` },
            ].map(({ label, href, external, download }, idx) => (
              <motion.a
                key={label}
                href={href}
                className="btn-outline-gradient relative overflow-hidden rounded-full px-8 py-3 font-semibold text-white text-base shadow-md border-2 border-transparent bg-clip-padding transition-all duration-500"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...(download ? { download } : {})}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                transition={{
                  duration: 0.5,
                  delay: isInView ? 1.4 + idx * 0.1 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: 'center' }}
            >
                <span className="relative z-10">{label}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInSmooth {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .blinking-cursor {
          display: inline-block;
          width: 1ch;
          margin-left: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: blink 1s step-start infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        /* Gradient outline → filled hover */
        .btn-outline-gradient {
          background: linear-gradient(#000, #000) padding-box,
            linear-gradient(90deg, #38bdf8, #10b981) border-box;
          border-radius: 9999px;
          border: 2px solid transparent;
          position: relative;
          isolation: isolate;
          transition: all 0.4s ease;
        }

        .btn-outline-gradient:hover {
          background: linear-gradient(90deg, #38bdf8, #10b981);
          color: #000;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }
      `}</style>
    </section>
  );
}

export default Profile;
