/**
 * Meridian EMS - Configuration
 * Centralized config from environment variables
 */

const config = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',

  // App
  appName: import.meta.env.VITE_APP_NAME || 'Meridian EMS',
  appTagline: import.meta.env.VITE_APP_TAGLINE || 'Smart Education Management System',

  // Contact
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'N/A',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || 'N/A',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'N/A',
  contactPhone: import.meta.env.VITE_CONTACT_PHONE || 'N/A',
  companyAddress: import.meta.env.VITE_COMPANY_ADDRESS || 'N/A',

  // Demo
  demoBookingEmail: import.meta.env.VITE_DEMO_BOOKING_EMAIL || '',

  // Features
  enableAiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // Analytics
  gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
  mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN || '',

  // Social
  social: {
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || '',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || '',
    github: import.meta.env.VITE_SOCIAL_GITHUB || '',
  },

  // Environment
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
}

export default config
