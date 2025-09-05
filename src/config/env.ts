/**
 * Environment configuration
 * This file centralizes all environment variables and provides default values
 */

// API Configuration
export const API_URL =
  import.meta.env.VITE_API_URL || "https://api.truckie.com/v1";
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 30000);

// Authentication
export const AUTH_TOKEN_KEY =
  import.meta.env.VITE_AUTH_TOKEN_KEY || "truckie_auth_token";
export const AUTH_REFRESH_TOKEN_KEY =
  import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || "truckie_refresh_token";

// Map Configuration
export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
export const MAP_DEFAULT_CENTER = {
  lat: Number(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT || 10.762622),
  lng: Number(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG || 106.660172),
};
export const MAP_DEFAULT_ZOOM = Number(
  import.meta.env.VITE_MAP_DEFAULT_ZOOM || 12
);

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Truckie";
export const APP_DESCRIPTION =
  import.meta.env.VITE_APP_DESCRIPTION ||
  "Transportation Management System with Real-Time GPS Order Tracking";
export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@truckie.com";
export const SUPPORT_PHONE =
  import.meta.env.VITE_SUPPORT_PHONE || "02873005588";

// Feature Flags
export const FEATURES = {
  LIVE_TRACKING: import.meta.env.VITE_FEATURE_LIVE_TRACKING === "true",
  NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS === "true",
  CHAT: import.meta.env.VITE_FEATURE_CHAT === "true",
};
