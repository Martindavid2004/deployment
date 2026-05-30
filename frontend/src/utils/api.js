// API configuration that works with both local development and port forwarding
const getApiBase = () => {
  console.log('🚀 API_JS_VERSION: 3.2 (Render Production Backend)'); // Proof of update

  // 1. Force environment variable check (highest priority for production)
  if (import.meta.env.VITE_API_URL) {
    console.log('📦 Using VITE_API_URL from environment:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // 2. Check for Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('☁️ Detected Vercel deployment, using Render Backend');
    return 'https://codo-ai.onrender.com';
  }

  // 3. Check for Netlify deployment - use production Render backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    console.log('🌐 Detected Netlify deployment, using Render Backend');
    return 'https://codo-ai.onrender.com';
  }

  // For development with port forwarding
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // If accessing via a forwarded port (not localhost), construct API URL
    // This handles VS Code port forwarding, ngrok, tunnels, etc.
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // For forwarded URLs, try to construct the backend URL
      // Most forwarding services replace port numbers in the hostname

      // Check if hostname contains a port number pattern (e.g., abc-5173.domain.com)
      const portInHostname = hostname.match(/-(\d{4,5})\./);

      if (portInHostname) {
        // Replace frontend port with backend port 8000
        const backendHostname = hostname.replace(/-\d{4,5}\./, '-8000.');
        const apiUrl = `${protocol}//${backendHostname}`;
        console.log('🌐 Detected forwarded port, using:', apiUrl);
        return apiUrl;
      }
    }
  }

  // Default to localhost for local development
  console.log('🏠 Using localhost for development');
  return 'http://localhost:8000';
};

export const API_BASE = getApiBase();

console.log('🔗 API Base URL:', API_BASE);
