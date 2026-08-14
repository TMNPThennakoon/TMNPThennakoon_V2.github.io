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

// Helper to convert Google Drive links to direct image URLs
const convertGoogleDriveLink = (url) => {
  if (!url) return url;
  if (url.includes('wikipedia.org')) {
    const mediaMatch = url.match(/[#\/]media\/File:([^\/?#]+)/i);
    if (mediaMatch) {
      const filename = decodeURIComponent(mediaMatch[1]);
      const firstChar = filename.charAt(0).toUpperCase();
      const firstTwoChars = filename.substring(0, 2).replace(/\s/g, '_');
      return `https://upload.wikimedia.org/wikipedia/commons/thumb/${firstChar}/${firstTwoChars}/${filename}/500px-${filename}`;
    }
    return url;
  }
  
  let fileId = null;
  const driveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1) fileId = driveMatch1[1];
  const driveMatch2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && !fileId) fileId = driveMatch2[1];
  const driveMatch3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch3 && !fileId) fileId = driveMatch3[1];
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  if (url.includes('uc?export=view') || url.includes('thumbnail?id=')) {
    return url;
  }
  if (!url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`;
  }
  return url;
};

import ThreeCanvas from './ThreeCanvas';

function Profile() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isInView, setIsInView] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const profile = portfolioData?.profile || {};
  const wordsToAnimate = profile.typingWords || ['Engineering Technology Student', 'Web Developer', 'UI/UX Designer'];

  // Calculate active profile images for slideshow
  const activeImages = (profile?.profileImages && profile.profileImages.length > 0)
    ? profile.profileImages.filter(img => (typeof img === 'object' ? img.enabled !== false : true)).map(img => typeof img === 'object' ? img.url : img)
    : [profile?.profileImage || '/pro.png'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (activeImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeImages.length]);

  const rawCurrentSrc = activeImages[currentImageIndex] || profile?.profileImage || '/pro.png';
  const activeSrc = convertGoogleDriveLink(rawCurrentSrc);

  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail) setPortfolioData(event.detail);
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
      if (latest) setPortfolioData(latest);
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

  // Typing effect
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % wordsToAnimate.length;
      const fullText = wordsToAnimate[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, wordsToAnimate]);

  // 3D tilt effect on profile image
  useEffect(() => {
    if (!imageRef.current) return;

    const element = imageRef.current;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
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
      <ThreeCanvas
        preset={portfolioData?.animationConfig?.preset || 'icosahedron'}
        autoRandom={portfolioData?.animationConfig?.autoRandom || false}
        changeInterval={portfolioData?.animationConfig?.changeInterval || 20}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% 10%, rgba(99, 179, 237, 0.15), transparent 60%), radial-gradient(1000px 500px at 90% 90%, rgba(45, 212, 191, 0.12), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-7xl mx-auto" ref={contentRef}>
        {/* Profile Image with Slideshow support */}
        <div
          ref={imageRef}
          className="relative group transition-transform duration-300 ease-out"
          style={{ animation: 'fadeInSmooth 1.2s ease-out', transformStyle: 'preserve-3d' }}
        >
          <img
            key={activeSrc}
            src={activeSrc}
            alt={profile.name || 'Profile'}
            className="w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full border-8 border-white/20 object-cover shadow-2xl transition-all duration-700 animate-fadeIn"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const imgElement = e.target;
              let attemptCount = parseInt(imgElement.dataset.attemptCount || '0');
              attemptCount++;
              imgElement.dataset.attemptCount = attemptCount.toString();
              
              if (rawCurrentSrc && rawCurrentSrc.includes('drive.google.com') && attemptCount <= 2) {
                const fileIdMatch = rawCurrentSrc.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  rawCurrentSrc.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  rawCurrentSrc.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (fileIdMatch) {
                  imgElement.src = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                  return;
                }
              }
              imgElement.src = '/pro.png';
            }}
          />
        </div>

        <div className="text-center lg:text-left space-y-6 max-w-2xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          {/* Name with animation */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent pb-3 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {profile.name}
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto lg:mx-0 shadow-lg"
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Typing animation title */}
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-md"
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
            className="text-lg sm:text-xl text-gray-200 font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
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

          {/* Social / CTAs */}
          <motion.div
            className="flex justify-center lg:justify-start items-center gap-4 pt-8 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {[
              {
                label: 'GitHub',
                href: profile.socialLinks?.github,
                external: true,
              },
              {
                label: 'LinkedIn',
                href: profile.socialLinks?.linkedin,
                external: true,
              },
              {
                label: 'Email',
                href: `mailto:${profile.socialLinks?.email}`,
                external: false,
              },
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                target={btn.external ? '_blank' : '_self'}
                rel={btn.external ? 'noopener noreferrer' : ''}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-sky-400/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {btn.label}
              </a>
            ))}
            {profile.socialLinks?.cv && (
              <a
                href={profile.socialLinks.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-bold hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20"
              >
                Download CV
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
