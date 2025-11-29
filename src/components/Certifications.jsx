import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FaExternalLinkAlt } from 'react-icons/fa';
import { getPortfolioData } from '../utils/portfolioData';

// Function to convert Wikipedia URLs to direct image URLs
const convertWikipediaUrl = (url) => {
  if (!url) return url;
  
  // Check if it's a Wikipedia URL
  if (!url.includes('wikipedia.org')) {
    return url;
  }
  
  // If it's already a Wikimedia Commons direct URL, return as is
  if (url.includes('upload.wikimedia.org')) {
    return url;
  }
  
  // Extract filename from Wikipedia URL
  // Format: https://en.wikipedia.org/wiki/...#/media/File:Filename.png
  // Or: https://en.wikipedia.org/wiki/.../media/File:Filename.png
  const mediaMatch = url.match(/[#\/]media\/File:([^\/?#]+)/i);
  if (mediaMatch) {
    const filename = decodeURIComponent(mediaMatch[1]);
    
    // Try to get the actual Commons path by using the filename structure
    // Wikimedia Commons uses a hash-based directory structure
    // First character, then first two characters for subdirectories
    const firstChar = filename.charAt(0).toUpperCase();
    const firstTwoChars = filename.substring(0, 2).replace(/\s/g, '_');
    
    // Try thumbnail format first (most reliable for images)
    // If this doesn't work, error handler will try direct Commons URL
    const thumbnailUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${firstChar}/${firstTwoChars}/${filename}/500px-${filename}`;
    return thumbnailUrl;
  }
  
  // If no media match, return original URL (may be a direct link)
  return url;
};

// Function to convert Google Drive links to direct image URLs
const convertGoogleDriveLink = (url) => {
  if (!url) return url;
  
  // First check if it's a Wikipedia URL
  if (url.includes('wikipedia.org')) {
    return convertWikipediaUrl(url);
  }
  
  // Check if it's a Google Drive link in various formats
  let fileId = null;
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
  const driveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1) {
    fileId = driveMatch1[1];
  }
  
  // Format 2: https://drive.google.com/open?id=FILE_ID
  const driveMatch2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && !fileId) {
    fileId = driveMatch2[1];
  }
  
  // Format 3: Already has file ID in different format
  const driveMatch3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch3 && !fileId) {
    fileId = driveMatch3[1];
  }
  
  if (fileId) {
    // Try thumbnail format first (more reliable for images)
    // Falls back to uc?export=view in error handler if needed
    // Note: File must be shared publicly with "Anyone with the link can view"
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // Check if it's already a direct image URL
  if (url.includes('uc?export=view') || url.includes('thumbnail?id=')) {
    return url;
  }
  
  // Return original URL if not a Google Drive link
  return url;
};

// Function to get Google Drive file ID from any format
const getGoogleDriveFileId = (url) => {
  if (!url) return null;
  
  // Try different patterns
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export default function Certifications() {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const [isPaused, setIsPaused] = useState(false);
  const certifications = portfolioData.certifications || [];
  
  useInView(containerRef, { once: true, margin: "-20% 0px -20% 0px" });
  
  // Track title visibility (same as Projects)
  const isTitleInView = useInView(titleRef, { 
    once: false, 
    amount: 0.2 
  });

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

  // Mouse wheel scroll handler
  useEffect(() => {
    const scrollContainer = scrollWrapperRef.current;
    if (!scrollContainer) return;

    let scrollTimeout = null;

    const handleWheel = (e) => {
      e.preventDefault();
      
      // Pause auto-scroll when user scrolls
      setIsPaused(true);
      
      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Scroll horizontally (convert vertical scroll to horizontal)
      scrollContainer.scrollLeft += e.deltaY;
      
      // Resume auto-scroll after 2 seconds of no scrolling
      scrollTimeout = setTimeout(() => {
        setIsPaused(false);
      }, 2000);
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Scroll progress bar
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const progressOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section
      id="certifications"
      ref={sectionRef}
      className="relative min-h-screen bg-black text-white overflow-hidden py-24 px-4 sm:px-6"
    >
      {/* Background gradient lights */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% 20%, rgba(99, 179, 237, 0.14), transparent 60%), radial-gradient(900px 500px at 85% 80%, rgba(45, 212, 191, 0.12), transparent 60%)",
        }}
      />

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12">
        {/* Section Title with scroll animation (matching Projects) */}
        <div 
          ref={titleRef}
          className={`text-center transition-all duration-600 ease-out ${
            isTitleInView
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-90'
          }`}
        >
          <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent pb-3">
            Certifications
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto" />
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Industry-recognized credentials showcasing my skills and dedication.
          </p>
        </div>

        {/* Certification Cards - Auto-scrolling Horizontal (3 visible by default) */}
        <div className="relative cert-scroll-container">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-black/80 to-black pointer-events-none z-10"></div>
          
          <div 
            className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide cert-scroll-container-inner" 
            ref={scrollWrapperRef} 
            style={{ scrollBehavior: 'smooth', cursor: 'grab' }}
            onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
            onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
          >
            <div className={`cert-scroll-wrapper flex gap-8 px-4 ${isPaused ? 'scroll-paused' : ''}`}>
              {/* Duplicate cards for seamless loop */}
              {[...certifications, ...certifications].map((cert, idx) => (
                <div 
                  key={`${cert.id || idx}-${Math.floor(idx / certifications.length)}`}
                  className="flex-shrink-0 cert-card-item"
                  style={{ 
                    width: 'calc((100vw - 12rem) / 3)',
                    minWidth: '350px',
                    maxWidth: '420px'
                  }}
                >
                  <CertCard cert={cert} idx={idx % certifications.length} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrolling badge marquee */}
        {certifications.length > 0 && (
          <div className="relative w-full overflow-hidden pt-6">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
            <motion.div
              aria-hidden
              className="flex gap-12 items-center whitespace-nowrap will-change-transform"
              animate={{ x: [0, -600] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 18 }}
            >
              {certifications.concat(certifications).map((c, i) => {
                const logoUrl = convertGoogleDriveLink(c.logo);
                const fallbackUrl = convertGoogleDriveLink(c.logoFallback);
                return (
                  <div key={i} className="flex items-center gap-3 opacity-80">
                    {logoUrl && (
                      <img 
                        src={logoUrl} 
                        alt={c.provider} 
                        className="h-8 w-8 rounded-sm object-contain" 
                        onError={(e) => {
                          if (fallbackUrl && e.target.src !== fallbackUrl) {
                            e.target.src = fallbackUrl;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }} 
                      />
                    )}
                    <span className="text-sm text-gray-300">{c.provider}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </div>

      {/* Styles (no CSS transform on hover; glow + shine kept) */}
      <style>{`
        .card-glow {
          background: linear-gradient(#0b0b0b, #0b0b0b) padding-box,
                      linear-gradient(90deg, rgba(56,189,248,0.75), rgba(16,185,129,0.75)) border-box;
          border: 1.5px solid transparent;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.35);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transition:
            box-shadow .5s ease,
            border-color .45s ease,
            filter .5s ease;
        }
        .card-glow:before {
          content: "";
          position: absolute;
          inset: -1px;
          background:
            radial-gradient(800px 180px at var(--sx, 10%) -20%, rgba(56,189,248,.28), transparent 35%),
            radial-gradient(520px 140px at var(--sx, 90%) 120%, rgba(16,185,129,.24), transparent 35%);
          opacity: var(--so, 0);
          transition: opacity .35s ease;
          pointer-events: none;
        }
        .card-glow:after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 28px;
          background:
            radial-gradient(60% 60% at 50% 0%, rgba(56,189,248,.35), transparent 70%),
            radial-gradient(55% 55% at 80% 100%, rgba(16,185,129,.30), transparent 70%);
          filter: blur(28px);
          opacity: 0;
          transition: opacity .45s ease;
          pointer-events: none;
        }
        .card-glow:hover {
          box-shadow:
            0 20px 65px rgba(56,189,248,0.28),
            0 12px 38px rgba(16,185,129,0.22),
            0 5px 10px rgba(0,0,0,0.4);
          filter: brightness(1.08);
        }
        .card-glow:hover:before,
        .card-glow:hover:after {
          opacity: 1;
        }

        .img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transform: translateZ(0);
        }
        .shine-img {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.28) 45%, transparent 60%);
          transform: translateX(-120%);
        }
        .img-wrap:hover .shine-img { animation: shine 1.05s ease forwards; opacity: 1; }
        @keyframes shine { to { transform: translateX(120%); } }

        .img-zoom { transition: transform .5s cubic-bezier(.22,1,.36,1); will-change: transform; }
        .card-glow:hover .img-zoom { transform: scale(1.06); }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Auto-scrolling animation */
        .cert-scroll-container {
          position: relative;
        }

        .cert-scroll-wrapper {
          animation: scroll-certifications 30s linear infinite;
          will-change: transform;
          width: max-content;
          display: flex;
        }

        /* Pause animation on hover */
        .cert-scroll-container:hover .cert-scroll-wrapper,
        .cert-card-item:hover {
          animation-play-state: paused;
        }

        /* Pause when user manually scrolls with mouse wheel */
        .cert-scroll-wrapper.scroll-paused {
          animation-play-state: paused !important;
        }

        @keyframes scroll-certifications {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Smooth transitions */
        .cert-card-item {
          transition: transform 0.3s ease;
        }
        
        /* Ensure cards are interactive even during animation */
        .cert-card-item * {
          pointer-events: auto;
        }

        /* Gradient outline button */
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

// ✅ Single Certification Card
function CertCard({ cert, idx }) {
  const cardRef = useRef(null);
  useInView(cardRef, { once: true, margin: "-10% 0px -10% 0px" });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      el.style.setProperty("--sx", `${x}%`);
      el.style.setProperty("--so", `1`);
    };
    const onLeave = () => el.style.setProperty("--so", `0`);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Generate link if not provided
  const certLink = cert.link || cert.credentialUrl || '#';
  
  // Convert Google Drive links to direct image URLs
  const logoUrl = convertGoogleDriveLink(cert.logo);
  const fallbackUrl = convertGoogleDriveLink(cert.logoFallback);
  
  // Get original Google Drive link for fallback
  const originalDriveLink = cert.logo || cert.logoFallback;
  const driveFileId = getGoogleDriveFileId(originalDriveLink);

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{
        duration: 0.85,
        delay: idx * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ transformOrigin: "center", willChange: "transform" }}
      className="card-glow p-6 sm:p-8 backdrop-blur-md"
    >
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <div className="img-wrap h-20 w-20 sm:h-24 sm:w-24">
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt={`${cert.provider} badge`}
                  className="img-zoom h-full w-full object-contain"
                  loading="lazy"
                  crossOrigin={logoUrl && logoUrl.includes('wikimedia.org') ? 'anonymous' : undefined}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    const imgElement = e.target;
                    let attemptCount = parseInt(imgElement.dataset.attemptCount || '0');
                    attemptCount++;
                    imgElement.dataset.attemptCount = attemptCount.toString();
                    
                    // Try fallback URL first (attempt 1)
                    if (attemptCount === 1 && fallbackUrl && currentSrc !== fallbackUrl) {
                      imgElement.src = fallbackUrl;
                      // Reset crossOrigin for fallback if it's a Wikipedia URL
                      if (fallbackUrl.includes('wikimedia.org')) {
                        imgElement.crossOrigin = 'anonymous';
                      }
                      return;
                    }
                    
                    // For Wikipedia URLs, try alternative formats
                    if (cert.logoFallback && cert.logoFallback.includes('wikipedia.org') && attemptCount === 2) {
                      const originalUrl = cert.logoFallback;
                      const mediaMatch = originalUrl.match(/[#\/]media\/File:([^\/?#]+)/i);
                      if (mediaMatch) {
                        const filename = decodeURIComponent(mediaMatch[1]);
                        // Try direct Commons URL (no thumb path)
                        imgElement.src = `https://upload.wikimedia.org/wikipedia/commons/${filename}`;
                        imgElement.crossOrigin = 'anonymous';
                        return;
                      }
                    }
                    
                    // For Wikipedia URLs, try alternative thumbnail format (attempt 3)
                    if (cert.logoFallback && cert.logoFallback.includes('wikipedia.org') && attemptCount === 3) {
                      const originalUrl = cert.logoFallback;
                      const mediaMatch = originalUrl.match(/[#\/]media\/File:([^\/?#]+)/i);
                      if (mediaMatch) {
                        const filename = decodeURIComponent(mediaMatch[1]);
                        // Try with lowercase first char and underscore handling
                        const firstChar = filename.charAt(0).toLowerCase();
                        const safeFilename = filename.replace(/\s/g, '_');
                        imgElement.src = `https://upload.wikimedia.org/wikipedia/commons/thumb/${firstChar}/${safeFilename.substring(0, 2)}/${safeFilename}/300px-${safeFilename}`;
                        imgElement.crossOrigin = 'anonymous';
                        return;
                      }
                    }
                    
                    // Try alternative Google Drive formats (attempt 2+)
                    if (driveFileId && attemptCount <= 5) {
                      if (attemptCount === (cert.logoFallback?.includes('wikipedia.org') ? 3 : 2)) {
                        // Try uc?export=view format
                        imgElement.src = `https://drive.google.com/uc?export=view&id=${driveFileId}`;
                        return;
                      } else if (attemptCount === (cert.logoFallback?.includes('wikipedia.org') ? 4 : 3)) {
                        // Try uc?export=download format
                        imgElement.src = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
                        return;
                      } else if (attemptCount === (cert.logoFallback?.includes('wikipedia.org') ? 5 : 4)) {
                        // Try smaller thumbnail as last resort
                        imgElement.src = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w500`;
                        return;
                      }
                    }
                    
                    // If all formats fail, show fallback icon with click to view
                    imgElement.style.display = 'none';
                    const fallback = imgElement.parentElement.querySelector('.logo-fallback');
                    if (fallback) {
                      fallback.style.display = 'flex';
                      // Make it clickable to open original link
                      const originalLink = cert.logo || cert.logoFallback;
                      if (originalLink && (originalLink.includes('drive.google.com') || originalLink.includes('wikipedia.org'))) {
                        fallback.style.cursor = 'pointer';
                        fallback.onclick = (evt) => {
                          evt.preventDefault();
                          window.open(originalLink, '_blank', 'noopener,noreferrer');
                        };
                        fallback.title = 'Click to view certificate image';
                        fallback.className += ' hover:opacity-80 transition-opacity';
                      }
                    }
                  }}
                />
                <span className="shine-img" />
                <div 
                  className="logo-fallback hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"
                  onClick={(e) => {
                    if (originalDriveLink && originalDriveLink.includes('drive.google.com')) {
                      e.preventDefault();
                      window.open(originalDriveLink, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  style={{ cursor: originalDriveLink && originalDriveLink.includes('drive.google.com') ? 'pointer' : 'default' }}
                  title={originalDriveLink && originalDriveLink.includes('drive.google.com') ? 'Click to view certificate image' : ''}
                >
                  <i className={`${cert.icon || 'fa-solid fa-certificate'} text-2xl text-white`}></i>
                </div>
              </>
            ) : (
              <div 
                className="logo-fallback flex absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"
                onClick={(e) => {
                  if (originalDriveLink && originalDriveLink.includes('drive.google.com')) {
                    e.preventDefault();
                    window.open(originalDriveLink, '_blank', 'noopener,noreferrer');
                  }
                }}
                style={{ cursor: originalDriveLink && originalDriveLink.includes('drive.google.com') ? 'pointer' : 'default' }}
                title={originalDriveLink && originalDriveLink.includes('drive.google.com') ? 'Click to view certificate image' : ''}
              >
                <i className={`${cert.icon || 'fa-solid fa-certificate'} text-2xl text-white`}></i>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold leading-tight text-white/95">
            {cert.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{cert.provider}</p>
          <p className="text-sm text-gray-500 mt-1">{cert.date}</p>
          {cert.credentialId && (
            <p className="text-xs text-gray-500 mt-1">
              Credential ID: <span className="text-gray-300">{cert.credentialId}</span>
            </p>
          )}

          <div className="mt-4">
            <a
              href={certLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gradient relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold text-white border-2 border-transparent bg-clip-padding hover:scale-[1.03] transition-all duration-500 inline-flex items-center gap-2"
            >
              <span className="relative z-10">View credential</span>
              <FaExternalLinkAlt size={16} className="opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
