import React, { useState, useEffect } from 'react';
// NEW: Importing icons for a professional look
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { getPortfolioData } from '../utils/portfolioData';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(''); // To show submission status
  const [portfolioData, setPortfolioData] = useState(getPortfolioData());
  const contact = portfolioData.contact;

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    // Simulate a network request
    setTimeout(() => {
      // In a real app, you'd handle success/error from your backend here
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
      
      // Clear the status message after a few seconds
      setTimeout(() => setStatus(''), 5000);
    }, 1000);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section heading matching reference UI */}
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-400 to-emerald-400 mx-auto mb-6" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? I&apos;d love to hear from you!
          </p>
        </div>

        {/* Content: left info, right form (like attachment) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Contact Info Card */}
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 h-full">
              <h3 className="text-2xl font-bold mb-6 text-white">Let&apos;s Connect</h3>
              <div className="space-y-6">
                {[
                  { icon: <FiMail />, title: 'Email', value: contact.email, link: `mailto:${contact.email}` },
                  { icon: <FiPhone />, title: 'Phone', value: contact.phone, link: '' },
                  { icon: <FiMapPin />, title: 'Location', value: contact.location },
                ].map((contactItem, i) => (
                  <div key={i} className="flex items-center space-x-4 group">
                    <div className="text-xl text-white transition-transform duration-300">{contactItem.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{contactItem.title}</p>
                      {contactItem.link ? 
                        <a href={contactItem.link} className="text-white hover:text-blue-400 transition-colors text-base">{contactItem.value}</a> :
                        <p className="text-white text-base">{contactItem.value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="group mb-4">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Pabasara Thennakoon"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
              </div>
              
              <div className="group mb-4">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="pabasara@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                />
              </div>

              <div className="group mb-4">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Your Message</label>
                <textarea
                  name="message"
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black p-4 rounded-lg font-bold text-base hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              
              {status && <p className="text-center mt-4 text-green-400">{status}</p>}
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Contact;
