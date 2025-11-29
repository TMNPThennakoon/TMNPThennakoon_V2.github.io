import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaArrowLeft, FaExternalLinkAlt, FaPlay } from 'react-icons/fa';
import { getPortfolioData } from '../utils/portfolioData';

// Helper function to get video embed URL
const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Direct video URL (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return url;
  }
  
  return null;
};

// Helper function to detect video type
const getVideoType = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) return 'direct';
  return null;
};

const ProjectDetail = ({ projectId, onBack }) => {
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    const projects = portfolioData.projects || [];
    const foundProject = projects.find(p => p.id === parseInt(projectId));
    
    if (foundProject) {
      setProject(foundProject);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [projectId, portfolioData]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Project not found</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 to-cyan-400 text-black font-semibold rounded-lg hover:from-sky-500 hover:to-cyan-500 transition-all duration-300"
          >
            <FaArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-black text-white overflow-hidden py-24 px-4 sm:px-6"
    >
      {/* Background gradient lights */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          background:
            'radial-gradient(1200px 600px at 15% 20%, rgba(99, 179, 237, 0.14), transparent 60%), radial-gradient(900px 500px at 85% 80%, rgba(45, 212, 191, 0.12), transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all duration-300 hover:border-cyan-400/50"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Projects</span>
        </motion.button>

        {/* Project Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-8 rounded-xl overflow-hidden group"
        >
          <img
            src={project.image.startsWith('/') ? project.image : `/${project.image}`}
            alt={project.title}
            className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = `./${project.image}`;
              e.target.onerror = null;
            }}
          />
          <div className="absolute top-4 right-4">
            <span className="px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-xs md:text-sm font-bold rounded-full border border-white/20">
              {project.categoryLabel}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Project Demo Video */}
        {project.video && getVideoEmbedUrl(project.video) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-sky-400 to-cyan-400 rounded"></div>
              <FaPlay className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl md:text-2xl font-semibold text-cyan-400">
                Project Demo Video
              </h2>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 shadow-2xl" style={{ paddingBottom: '56.25%', background: '#000' }}>
              {getVideoType(project.video) === 'direct' ? (
                <video
                  controls
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: 'contain' }}
                  preload="metadata"
                >
                  <source src={project.video} type="video/mp4" />
                  <source src={project.video} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={getVideoEmbedUrl(project.video)}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`${project.title} Demo Video`}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Project Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Title and Date */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              {project.title}
            </h1>
            {project.date && (
              <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                {project.date}
              </p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-sky-400 to-cyan-400 rounded"></span>
              Description
            </h2>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          {project.tech && project.tech.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-sky-400 to-cyan-400 rounded"></span>
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.tech.map((tech, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                    className="px-4 py-2 bg-gray-800/50 text-gray-300 text-sm md:text-base rounded-lg border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/70 transition-all duration-300"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-800">
            {project.github && project.github !== '#' && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 to-cyan-400 text-black font-semibold rounded-lg hover:from-sky-500 hover:to-cyan-500 transition-all duration-300 hover:scale-105 text-sm md:text-base shadow-lg shadow-sky-500/20"
              >
                <FaGithub className="w-5 h-5" />
                <span>View Source Code</span>
              </motion.a>
            )}
            {project.live && project.live !== '#' && (
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 hover:scale-105 text-sm md:text-base shadow-lg shadow-emerald-500/20"
              >
                <FaExternalLinkAlt className="w-5 h-5" />
                <span>Live Demo</span>
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectDetail;

