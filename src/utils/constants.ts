// API endpoints
// Always use the proxy path for both development and production
// In development: Vite dev server proxies /api/* to the backend
// In production: Cloudflare Pages Functions handle /api/* requests
export const API_ENDPOINT = '/api/createWorker';
export const STATS_API_ENDPOINT = "https://bestip.06151953.xyz/api/stats";

// Configuration
export const MAX_PROXY_IPS = parseInt(import.meta.env.VITE_MAX_PROXY_IPS || "50");

// Words for generating worker names
export const WORKER_NAME_WORDS = [
  // Fast and dynamic
  'swift', 'breeze', 'cloud', 'spark', 'nova', 'pulse', 'wave', 'flux', 'echo', 'zephyr', 
  'blaze', 'comet', 'drift', 'ember', 'flare', 'glow', 'haze', 'mist', 'quasar', 'ray', 
  'shine', 'twilight', 'vortex', 'whirl', 'zenith',
  // Tech-related
  'quantum', 'cyber', 'pixel', 'byte', 'data', 'crypto', 'neural', 'matrix', 'vector', 'binary',
  // Nature-inspired
  'aurora', 'storm', 'thunder', 'frost', 'glacier', 'ocean', 'river', 'forest', 'mountain', 'desert',
  // Space-themed
  'nebula', 'galaxy', 'cosmos', 'stellar', 'lunar', 'solar', 'astro', 'orbit', 'meteor', 'titan',
  // Power and energy
  'dynamo', 'fusion', 'plasma', 'photon', 'atomic', 'energy', 'power', 'force', 'charge', 'surge'
]; 