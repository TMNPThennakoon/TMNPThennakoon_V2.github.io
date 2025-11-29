import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { getPortfolioData } from '../utils/portfolioData';

// Function to convert Wikipedia URLs to direct image URLs
const convertWikipediaUrl = (url) => {
  if (!url) return url;
  if (!url.includes('wikipedia.org')) return url;
  if (url.includes('upload.wikimedia.org')) return url;
  
  const mediaMatch = url.match(/[#\/]media\/File:([^\/?#]+)/i);
  if (mediaMatch) {
    const filename = decodeURIComponent(mediaMatch[1]);
    const firstChar = filename.charAt(0).toUpperCase();
    const firstTwoChars = filename.substring(0, 2).replace(/\s/g, '_');
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${firstChar}/${firstTwoChars}/${filename}/500px-${filename}`;
  }
  return url;
};

// Function to convert Google Drive links to direct image URLs
const convertImageUrl = (url) => {
  if (!url) return url;
  
  // Check if it's a Wikipedia URL
  if (url.includes('wikipedia.org')) {
    return convertWikipediaUrl(url);
  }
  
  // Check if it's already a direct external URL (starts with http:// or https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Check if it's a Google Drive link
  let fileId = null;
  const driveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1) {
    fileId = driveMatch1[1];
  }
  
  const driveMatch2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && !fileId) {
    fileId = driveMatch2[1];
  }
  
  const driveMatch3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch3 && !fileId) {
    fileId = driveMatch3[1];
  }
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // If it's a local path, ensure it starts with /
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return `/${url}`;
  }
  
  return url;
};

const cardAnimationVariants = [
  {
    hidden: { opacity: 1, y: 32, scale: 0.96, rotateX: -4 },
    visible: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
  },
  {
    hidden: { opacity: 1, x: -28, scale: 0.95, rotateY: -4 },
    visible: { opacity: 1, x: 0, scale: 1, rotateY: 0 },
  },
  {
    hidden: { opacity: 1, x: 28, scale: 0.95, rotateY: 4 },
    visible: { opacity: 1, x: 0, scale: 1, rotateY: 0 },
  },
  {
    hidden: { opacity: 1, y: -24, scale: 0.97, rotateZ: -3 },
    visible: { opacity: 1, y: 0, scale: 1, rotateZ: 0 },
  },
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const projects = portfolioData.projects || [];

  // Function to truncate description for preview
  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Navigate to project detail page
  const handleProjectClick = (projectId) => {
    window.location.hash = `#/project/${projectId}`;
  };

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


  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'web', label: 'Web Development' },
    { key: 'mobile', label: 'Mobile Applications' },
    { key: 'ml', label: 'Machine Learning' },
    { key: 'automation', label: 'QA Automation' },
    { key: 'iot', label: 'IoT Systems' },
    { key: 'desktop', label: 'Desktop Applications' },
    { key: 'robotics', label: 'Robotics' },
    { key: 'mechanical', label: 'Mechanical Design' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  useEffect(() => {
    const titleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Once the title becomes visible, keep it visible
          setIsTitleVisible(true);
          titleObserver.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    const section = sectionRef.current;
    if (section) {
      const titleElement = section.querySelector('#projects-title');
      if (titleElement) {
        titleObserver.observe(titleElement);
      }
    }

    return () => {
      titleObserver.disconnect();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-20 md:py-24 min-h-screen bg-black text-white overflow-hidden"
    >
      {/* Background gradient lights */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          background:
            'radial-gradient(1200px 600px at 15% 20%, rgba(99, 179, 237, 0.14), transparent 60%), radial-gradient(900px 500px at 85% 80%, rgba(45, 212, 191, 0.12), transparent 60%)',
        }}
      />

      {/* Content wrapper above background */}
      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        <div className={`text-center mb-16 transition-all duration-600 ease-out ${
              isTitleVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-90'}`}>
          <h2
            id="projects-title"
            className="text-5xl sm:text-6xl font-extrabold pb-3 tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Projects
          </h2>
          <div
            className="h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto mt-3"
          />
          <p
            className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            A collection of projects that showcase my skills and experience.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-gradient-to-r from-sky-400 to-emerald-400 text-black'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:border-sky-400/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Project Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {filteredProjects.map((project, index) => {
            const variant = cardAnimationVariants[index % cardAnimationVariants.length];

            return (
              <motion.div
              key={project.id}
                data-index={index}
                variants={variant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(index * 0.03, 0.25),
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: "center", willChange: "transform" }}
                className="project-card relative mb-12 flex flex-col p-6 bg-white/10 backdrop-blur-md rounded-xl cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <img
                  src={convertImageUrl(project.image)}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  loading="lazy"
                  crossOrigin={project.image && (project.image.includes('wikimedia.org') || project.image.includes('wikipedia.org')) ? 'anonymous' : undefined}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const imgElement = e.target;
                    let attemptCount = parseInt(imgElement.dataset.attemptCount || '0');
                    attemptCount++;
                    imgElement.dataset.attemptCount = attemptCount.toString();
                    
                    // Try alternative Google Drive formats
                    if (project.image && project.image.includes('drive.google.com') && attemptCount <= 3) {
                      const fileIdMatch = project.image.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                      if (fileIdMatch) {
                        const fileId = fileIdMatch[1];
                        if (attemptCount === 1) {
                          imgElement.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                          return;
                        } else if (attemptCount === 2) {
                          imgElement.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
                          return;
                        }
                      }
                    }
                    
                    // Try local path as fallback
                    if (attemptCount <= 4 && project.image) {
                      const localPath = project.image.startsWith('/') ? project.image : `/${project.image}`;
                      if (imgElement.src !== localPath) {
                        imgElement.src = localPath;
                        return;
                      }
                    }
                    
                    // Show placeholder if all attempts fail
                    imgElement.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center';
                    placeholder.innerHTML = '<span class="text-gray-500 text-sm">Image not available</span>';
                    imgElement.parentElement.insertBefore(placeholder, imgElement);
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-md border border-blue-400/50 shadow-md">
                    {project.categoryLabel}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mt-6 text-left">{project.title}</h3>
                <p className="text-gray-300 text-sm mt-2 text-left flex-grow">
                  {truncateDescription(project.description)}
                </p>
                
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mt-4 mb-4">
                  {project.tech?.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-md border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech?.length > 3 && (
                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-md border border-white/20 hover:bg-white/20 transition-colors">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <button
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project.id);
                    }}
                  >
                    Read More →
                  </button>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 group"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Styles for gradient border/aura (matches Certifications card glow) */}
      <style>{`
        .project-card {
          background:
            linear-gradient(#0b0b0b, #0b0b0b) padding-box,
            linear-gradient(90deg, rgba(56,189,248,0.75), rgba(16,185,129,0.75)) border-box;
          border: 1.5px solid transparent;
          border-radius: 16px;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transition:
            box-shadow .5s ease,
            border-color .45s ease,
            filter .5s ease;
        }
        .project-card:hover {
          box-shadow:
            0 20px 65px rgba(56,189,248,0.28),
            0 12px 38px rgba(16,185,129,0.22),
            0 5px 10px rgba(0,0,0,0.4);
          filter: brightness(1.08);
        }
      `}</style>
    </section>
  );
};

export default Projects;
