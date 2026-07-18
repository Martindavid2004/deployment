// API configuration that works with both local development and port forwarding
const getApiBase = () => {
  console.log('🚀 API_JS_VERSION: 3.3 (Local Development Fix)');

  // 1. Check for environment variable (highest priority)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('📦 Using VITE_API_BASE_URL from environment:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Legacy support for VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    console.log('📦 Using VITE_API_URL from environment:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // 2. Check for Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('☁️ Detected Vercel deployment, using Render Backend');
    return 'https://deployment-plto.onrender.com';
  }

  // 3. Check for Netlify deployment - use production Render backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    console.log('🌐 Detected Netlify deployment, using Render Backend');
    return 'https://deployment-plto.onrender.com';
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

/**
 * Helper function for authenticated API calls
 * Automatically handles token and 401 errors
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };
  
  const response = await fetch(url, { ...options, headers });
  
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    console.log("[AUTH] 401 Unauthorized - clearing session");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    
    // Redirect to login
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }
  
  return response;
};
