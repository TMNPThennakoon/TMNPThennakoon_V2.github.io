// Session Management Utility
// Tracks active login sessions across devices for security
// Sessions are stored in GitHub (sessions.json) to sync across all devices

const GITHUB_OWNER = 'TMNPThennakoon';
const GITHUB_REPO = 'TMNP.Thennakoon_V2.github.io';
const SESSIONS_PATH = 'src/data/sessions.json';
const GITHUB_BRANCH = 'main';

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get device/browser information
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const screen = window.screen;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  // Detect device type
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  return {
    browser,
    os,
    deviceType,
    screenWidth: screen.width,
    screenHeight: screen.height,
    userAgent: ua.substring(0, 100), // Truncate for storage
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Fetch sessions from GitHub
 */
async function fetchSessionsFromGitHub(token) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SESSIONS_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.status === 404) {
      // File doesn't exist yet, return empty array
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.status}`);
    }

    const fileData = await response.json();
    const content = JSON.parse(atob(fileData.content.replace(/\s/g, '')));
    return Array.isArray(content) ? content : [];
  } catch (error) {
    console.error('Error fetching sessions from GitHub:', error);
    throw error;
  }
}

/**
 * Save sessions to GitHub
 */
async function saveSessionsToGitHub(sessions, token, sha = null) {
  try {
    const jsonString = JSON.stringify(sessions, null, 2);
    const content = btoa(unescape(encodeURIComponent(jsonString)));

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SESSIONS_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update active sessions - ${new Date().toISOString()}`,
          content: content,
          branch: GITHUB_BRANCH,
          ...(sha && { sha: sha })
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save sessions');
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving sessions to GitHub:', error);
    throw error;
  }
}

/**
 * Get current file SHA from GitHub
 */
async function getSessionsFileSha(token) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SESSIONS_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const fileData = await response.json();
    return fileData.sha;
  } catch (error) {
    return null;
  }
}

/**
 * Get all active sessions (from GitHub or localStorage fallback)
 */
export async function getActiveSessions() {
  const token = localStorage.getItem('githubToken');
  
  // Try GitHub first if token is available
  if (token) {
    try {
      const sessions = await fetchSessionsFromGitHub(token);
      // Filter out expired sessions (older than 30 days)
      const now = Date.now();
      const validSessions = sessions.filter(session => {
        const daysSinceLogin = (now - session.loginTime) / (1000 * 60 * 60 * 24);
        return daysSinceLogin < 30;
      });
      
      // Update if sessions were filtered
      if (validSessions.length !== sessions.length) {
        try {
          const sha = await getSessionsFileSha(token);
          await saveSessionsToGitHub(validSessions, token, sha);
        } catch (error) {
          console.error('Failed to update filtered sessions:', error);
        }
      }
      
      // Also update localStorage as cache
      try {
        localStorage.setItem('dashboardSessions', JSON.stringify(validSessions));
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return validSessions;
    } catch (error) {
      console.warn('Failed to fetch from GitHub, using localStorage:', error);
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const sessionsJson = localStorage.getItem('dashboardSessions');
    if (!sessionsJson) return [];
    const sessions = JSON.parse(sessionsJson);
    // Filter out expired sessions
    const now = Date.now();
    return sessions.filter(session => {
      const daysSinceLogin = (now - session.loginTime) / (1000 * 60 * 60 * 24);
      return daysSinceLogin < 30;
    });
  } catch (error) {
    console.error('Error reading sessions from localStorage:', error);
    return [];
  }
}

/**
 * Save sessions (to GitHub and localStorage)
 */
export async function saveSessions(sessions) {
  // Always update localStorage as cache
  try {
    localStorage.setItem('dashboardSessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error);
  }
  
  // Try to save to GitHub if token is available
  const token = localStorage.getItem('githubToken');
  if (token) {
    try {
      const sha = await getSessionsFileSha(token);
      await saveSessionsToGitHub(sessions, token, sha);
    } catch (error) {
      console.warn('Failed to save sessions to GitHub:', error);
      // Continue anyway - localStorage is updated
    }
  }
}

/**
 * Create a new session
 */
export async function createSession() {
  const sessionId = generateSessionId();
  const deviceInfo = getDeviceInfo();
  const loginTime = Date.now();
  
  const newSession = {
    id: sessionId,
    deviceInfo,
    loginTime,
    lastActivity: loginTime,
  };
  
  // Get existing sessions from GitHub or localStorage
  let existingSessions = [];
  try {
    existingSessions = await getActiveSessions();
  } catch (error) {
    console.warn('Failed to fetch existing sessions:', error);
  }
  
  // Remove any existing session from same device (based on user agent)
  const currentUserAgent = deviceInfo.userAgent;
  existingSessions = existingSessions.filter(s => 
    s.deviceInfo.userAgent !== currentUserAgent || 
    (Date.now() - s.loginTime) < 60000 // Keep if logged in less than 1 minute ago (same device re-login)
  );
  
  // Add new session at the beginning
  const allSessions = [newSession, ...existingSessions];
  
  // Keep only last 20 sessions for storage efficiency
  const sessionsToKeep = allSessions.slice(0, 20);
  
  // Save to GitHub and localStorage
  await saveSessions(sessionsToKeep);
  
  // Store current session ID
  localStorage.setItem('currentSessionId', sessionId);
  localStorage.setItem('dashboardAuth', 'true');
  
  return newSession;
}

/**
 * Get current session ID
 */
export function getCurrentSessionId() {
  return localStorage.getItem('currentSessionId');
}

/**
 * Update last activity time for current session
 */
export async function updateSessionActivity() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;
  
  try {
    const sessions = await getActiveSessions();
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        return { ...session, lastActivity: Date.now() };
      }
      return session;
    });
    
    await saveSessions(updatedSessions);
  } catch (error) {
    console.warn('Failed to update session activity:', error);
  }
}

/**
 * Remove a session by ID
 */
export async function removeSession(sessionId) {
  try {
    const sessions = await getActiveSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    await saveSessions(filteredSessions);
    
    // If removing current session, also clear auth
    const currentSessionId = getCurrentSessionId();
    if (sessionId === currentSessionId) {
      localStorage.removeItem('dashboardAuth');
      localStorage.removeItem('currentSessionId');
      return true; // Indicates current session was removed
    }
    
    return false;
  } catch (error) {
    console.error('Failed to remove session:', error);
    return false;
  }
}

/**
 * Remove all other sessions (keep only current)
 */
export async function removeAllOtherSessions() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;
  
  try {
    const sessions = await getActiveSessions();
    const currentSession = sessions.find(s => s.id === currentSessionId);
    
    if (currentSession) {
      await saveSessions([currentSession]);
    }
  } catch (error) {
    console.error('Failed to remove other sessions:', error);
  }
}

/**
 * Check if current session is valid
 */
export async function isCurrentSessionValid() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return false;
  
  try {
    const sessions = await getActiveSessions();
    const currentSession = sessions.find(s => s.id === currentSessionId);
    return !!currentSession;
  } catch (error) {
    // Fallback to localStorage check
    try {
      const sessionsJson = localStorage.getItem('dashboardSessions');
      if (!sessionsJson) return false;
      const sessions = JSON.parse(sessionsJson);
      return sessions.some(s => s.id === currentSessionId);
    } catch (e) {
      return false;
    }
  }
}

/**
 * Format date/time for display
 */
export function formatSessionTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get device display name
 */
export function getDeviceDisplayName(deviceInfo) {
  return `${deviceInfo.deviceType} - ${deviceInfo.browser} on ${deviceInfo.os}`;
}

