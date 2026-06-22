/* ═══════════════════════════════════════════
   SUPABASE CONFIG - Apni credentials yahan daalo
═══════════════════════════════════════════ */
// ⚠️ SECURITY: Apni actual credentials yahan daalo - hardcode mat karo public files mein
// In values ko environment variables ya server-side config se load karo
const SUPABASE_URL  = 'https://mksyzeodtaudhpgzeihs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc3l6ZW9kdGF1ZGhwZ3plaWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTU4ODQsImV4cCI6MjA5NjY5MTg4NH0.QfHdN0Qkd8RmhMjjiL1srP7ewUJ372zoti1c5QE0uiM';

const _supabase = (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        storageKey: 'alexcyberx-auth',  // unique key, dusri sites se clash nahi
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Global reference — index.html aur pages/*.html mein window._supabase use hota hai
window._supabase = _supabase;

