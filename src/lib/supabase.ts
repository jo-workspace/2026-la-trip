import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnitxohnywhzhrfgaxrr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaXR4b2hueXdoemhyZmdheHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjM4NDUsImV4cCI6MjEwMDUzOTg0NX0.hFpV8BzKFtY4sPza7nUk-EIGEsfSYxFcQlX33DpV8G4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
