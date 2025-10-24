// Configuration loader
// For development: reads from window.__ENV__ (set in index.html)
// For production: reads from Vercel environment variables (injected at build time)

const config = {
  supabase: {
    url: window.__ENV__?.SUPABASE_URL || 'https://meqisqhoguyzvezqdmbx.supabase.co',
    anonKey: window.__ENV__?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcWlzcWhvZ3V5enZlenFkbWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjIwOTksImV4cCI6MjA3Njc5ODA5OX0.c-5dHxOeWDippUYlAvGpU0gLfBQab-Bt1kOACqD9n50'
  }
};

// Export for use in other files
window.APP_CONFIG = config;
