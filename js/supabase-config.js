const SUPABASE_URL = 'https://zxtpydfmwwscxbzhpsdm.supabase.co'; //  URL AQUI
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dHB5ZGZtd3dzY3hiemhwc2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDU1MTQsImV4cCI6MjA4MDE4MTUxNH0.KdRkqeI1fSvFI6fwxTY7soGKHuOcFhB_NWATfDjpS9E'; // COLE SUA CHAVE AQUI

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});



// Exportar globalmente
window.supabase = supabase;

console.log('Supabase configurado com sucesso!');