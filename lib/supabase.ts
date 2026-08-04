import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kdhjbtyjiaegsjvpyhqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGpidHlqaWFlZ3NqdnB5aHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODQ2OTcsImV4cCI6MjA4OTg2MDY5N30.tdkogbax6oZH-dXRm9KEcOtZgB0uIDqvmCVGZM6hnAo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
