
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpfkaelamyenbhbwiqty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZmthZWxhbXllbmJoYndpcXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDk4NDUsImV4cCI6MjA4NTAyNTg0NX0.yeL3oVzOjswI7pbEHItlMuQZWHtTYkV6psf5dpTXE9c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
