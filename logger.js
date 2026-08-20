// Client-side logger that sends logs to a server endpoint
class WebLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const device = this.getDeviceInfo();

    const logEntry = {
      timestamp,
      level,
      message,
      data,
      device,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to browser console with emoji
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[level] || '📝';

    console.log(`${emoji} [${timestamp}] ${message}`, data);

    // Store in localStorage as backup
    this.saveToLocalStorage();
  }

  getDeviceInfo() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return {
      type: isMobile ? 'mobile' : 'desktop',
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`
    };
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save logs to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage:', e);
    }
  }

  downloadLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  getLogs() {
    return this.logs;
  }
}

// Create global logger instance
window.logger = new WebLogger();
window.logger.loadFromLocalStorage();

// Log page loads
window.logger.log('info', 'Page loaded');

// Expose functions to window for easy access
window.downloadLogs = () => window.logger.downloadLogs();
window.clearLogs = () => window.logger.clearLogs();
window.viewLogs = () => console.table(window.logger.getLogs());
