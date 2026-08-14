// Analytics and Visitor Tracking Utility
import initialSessions from '../data/sessions.json';

const SESSIONS_STORAGE_KEY = 'portfolio_visitor_sessions';

// Helper to detect device type
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

// Helper to detect browser
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1 && ua.indexOf('OPR') === -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Edg') > -1) return 'Edge';
  if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) return 'Opera';
  return 'Other Browser';
};

// Helper to detect OS
const getOS = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'macOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('like Mac') !== -1) return 'iOS';
  return 'Unknown OS';
};

// Fetch Visitor Location & IP with fallback
const fetchLocationInfo = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || 'Unknown IP',
        country: data.country_name || 'Unknown Country',
        city: data.city || 'Unknown City',
        region: data.region || '',
        org: data.org || ''
      };
    }
  } catch (err) {
    try {
      const res2 = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
      if (res2.ok) {
        const data2 = await res2.json();
        return {
          ip: data2.ip || 'Direct Visitor',
          country: 'Visitor Location',
          city: 'Detected City',
          region: '',
          org: ''
        };
      }
    } catch (e) {
      // Ignore network errors
    }
  }
  return {
    ip: 'Direct Visitor',
    country: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Global',
    city: 'Location',
    region: '',
    org: ''
  };
};

// Main function to record visitor session on app load
export const trackVisitorSession = async () => {
  // Prevent duplicate tracking within same session window (5 minutes throttle)
  const lastTracked = sessionStorage.getItem('last_tracked_time');
  const now = Date.now();
  if (lastTracked && now - parseInt(lastTracked) < 300000) {
    return;
  }
  sessionStorage.setItem('last_tracked_time', now.toString());

  const locationInfo = await fetchLocationInfo();

  const newSession = {
    id: `session_${now}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: now,
    date: new Date(now).toISOString().split('T')[0], // YYYY-MM-DD
    time: new Date(now).toLocaleTimeString(),
    device: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    ip: locationInfo.ip,
    location: `${locationInfo.city}${locationInfo.region ? ', ' + locationInfo.region : ''}, ${locationInfo.country}`,
    country: locationInfo.country,
    city: locationInfo.city,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  // Save to localStorage
  const existing = getStoredSessions();
  const updated = [newSession, ...existing.slice(0, 499)]; // Keep up to 500 recent sessions
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));

  // Trigger event for real-time dashboard listeners
  window.dispatchEvent(new CustomEvent('visitorSessionsUpdated', { detail: updated }));
};

// Get stored sessions (combining initial JSON + localStorage)
export const getStoredSessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    let localSessions = raw ? JSON.parse(raw) : [];
    
    // Normalize initial json sessions if any
    const normalizedInitial = (initialSessions || []).map(s => ({
      id: s.id || `session_${s.loginTime}`,
      timestamp: s.loginTime || Date.now(),
      date: new Date(s.loginTime || Date.now()).toISOString().split('T')[0],
      time: new Date(s.loginTime || Date.now()).toLocaleTimeString(),
      device: s.deviceInfo?.deviceType || 'Desktop',
      browser: s.deviceInfo?.browser || 'Browser',
      os: s.deviceInfo?.os || 'OS',
      screenWidth: s.deviceInfo?.screenWidth || 1280,
      screenHeight: s.deviceInfo?.screenHeight || 720,
      ip: s.ip || '192.168.1.1',
      location: s.location || 'Colombo, Sri Lanka',
      country: s.country || 'Sri Lanka',
      city: s.city || 'Colombo',
      timezone: s.deviceInfo?.timezone || 'Asia/Colombo'
    }));

    // Merge and deduplicate by id
    const map = new Map();
    [...localSessions, ...normalizedInitial].forEach(item => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    return [];
  }
};

// Export CSV analytics report
export const exportAnalyticsCSV = (sessions) => {
  if (!sessions || sessions.length === 0) return;

  const headers = ['Session ID', 'Date', 'Time', 'IP Address', 'Location', 'Device', 'Browser', 'OS', 'Screen Resolution'];
  const rows = sessions.map(s => [
    `"${s.id}"`,
    `"${s.date}"`,
    `"${s.time}"`,
    `"${s.ip}"`,
    `"${s.location}"`,
    `"${s.device}"`,
    `"${s.browser}"`,
    `"${s.os}"`,
    `"${s.screenWidth}x${s.screenHeight}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `visitor_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
