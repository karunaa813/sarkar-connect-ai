import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgvzdgzxejxbwzqihfcy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndnpkZ3p4ZWp4Ynd6cWloZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzI4NDgsImV4cCI6MjA4OTk0ODg0OH0.prDmgYFylRJ0uLdO4JFOE0_j0O_64CrUJ8Qt1ailM60';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
