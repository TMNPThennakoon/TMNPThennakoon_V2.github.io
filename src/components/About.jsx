import React, { useEffect, useRef, useState } from 'react';
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

function About() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const about = portfolioData?.about || {};

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-20 sm:py-24 bg-black overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div
            className={`order-2 lg:order-1 flex justify-center lg:justify-end transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
            }`}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img
                src={convertGoogleDriveLink(about.image || '/pro2.png')}
                alt={about.title || 'About Me'}
                className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-2xl object-cover border-4 border-white/20 shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const imgElement = e.target;
                  let attemptCount = parseInt(imgElement.dataset.attemptCount || '0');
                  attemptCount++;
                  imgElement.dataset.attemptCount = attemptCount.toString();
                  
                  if (about.image && about.image.includes('drive.google.com') && attemptCount <= 2) {
                    const fileIdMatch = about.image.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      about.image.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                      about.image.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch) {
                      imgElement.src = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                      return;
                    }
                  }
                  imgElement.src = '/pro2.png';
                }}
              />
            </div>
          </div>

          {/* Content Section */}
          <div
            className={`order-1 lg:order-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {about.title || 'About Me'}
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-6">
              {about.subtitle}
            </h3>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent mb-8"></div>
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              {about.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
