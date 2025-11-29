// Session Management Utility
// Tracks active login sessions across devices for security

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
 * Get all active sessions
 */
export function getActiveSessions() {
  try {
    const sessionsJson = localStorage.getItem('dashboardSessions');
    if (!sessionsJson) return [];
    const sessions = JSON.parse(sessionsJson);
    // Filter out expired sessions (older than 30 days)
    const now = Date.now();
    const validSessions = sessions.filter(session => {
      const daysSinceLogin = (now - session.loginTime) / (1000 * 60 * 60 * 24);
      return daysSinceLogin < 30;
    });
    // Update storage if sessions were filtered
    if (validSessions.length !== sessions.length) {
      saveSessions(validSessions);
    }
    return validSessions;
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
}

/**
 * Save sessions to localStorage
 */
export function saveSessions(sessions) {
  try {
    localStorage.setItem('dashboardSessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

/**
 * Create a new session
 */
export function createSession() {
  const sessionId = generateSessionId();
  const deviceInfo = getDeviceInfo();
  const loginTime = Date.now();
  
  const newSession = {
    id: sessionId,
    deviceInfo,
    loginTime,
    lastActivity: loginTime,
    isCurrent: true,
  };
  
  // Get existing sessions and mark them as not current
  const existingSessions = getActiveSessions().map(s => ({ ...s, isCurrent: false }));
  
  // Add new session at the beginning
  const allSessions = [newSession, ...existingSessions];
  
  // Keep only last 10 sessions for storage efficiency
  const sessionsToKeep = allSessions.slice(0, 10);
  
  saveSessions(sessionsToKeep);
  
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
export function updateSessionActivity() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;
  
  const sessions = getActiveSessions();
  const updatedSessions = sessions.map(session => {
    if (session.id === currentSessionId) {
      return { ...session, lastActivity: Date.now() };
    }
    return session;
  });
  
  saveSessions(updatedSessions);
}

/**
 * Remove a session by ID
 */
export function removeSession(sessionId) {
  const sessions = getActiveSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  saveSessions(filteredSessions);
  
  // If removing current session, also clear auth
  const currentSessionId = getCurrentSessionId();
  if (sessionId === currentSessionId) {
    localStorage.removeItem('dashboardAuth');
    localStorage.removeItem('currentSessionId');
    return true; // Indicates current session was removed
  }
  
  return false;
}

/**
 * Remove all other sessions (keep only current)
 */
export function removeAllOtherSessions() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;
  
  const sessions = getActiveSessions();
  const currentSession = sessions.find(s => s.id === currentSessionId);
  
  if (currentSession) {
    saveSessions([currentSession]);
  }
}

/**
 * Check if current session is valid
 */
export function isCurrentSessionValid() {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return false;
  
  const sessions = getActiveSessions();
  const currentSession = sessions.find(s => s.id === currentSessionId);
  
  return !!currentSession;
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

