import { createClient } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";

class CapacitorPreferencesStore {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}

const supabaseUrl = "https://ulwqfzndiaomknuczazo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsd3Fmem5kaWFvbWtudWN6YXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzE1NzQsImV4cCI6MjA1NzIwNzU3NH0.qPchQbv8RVdy_SF3ZBIcjXY8Si3m9XkpouirKAIla7Y";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: new CapacitorPreferencesStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
