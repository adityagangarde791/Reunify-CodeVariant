import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or user configured local settings
const storedConfig = typeof window !== 'undefined' ? localStorage.getItem('reunify_supabase_config') : null;
let parsedStoredConfig: { url?: string; anonKey?: string } = {};

if (storedConfig) {
  try {
    parsedStoredConfig = JSON.parse(storedConfig);
  } catch {
    // Ignore invalid JSON
  }
}

export const SUPABASE_URL = 
  parsedStoredConfig.url || 
  import.meta.env.VITE_SUPABASE_URL || 
  '';

export const SUPABASE_ANON_KEY = 
  parsedStoredConfig.anonKey || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_ANON_KEY && 
    !SUPABASE_URL.includes('your-project-id') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

// Create real client or a placeholder safe client
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  localStorage.setItem('reunify_supabase_config', JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('reunify_supabase_config');
  window.location.reload();
};
