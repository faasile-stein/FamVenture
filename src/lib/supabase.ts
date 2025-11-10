// Supabase client configuration
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

// These should be in your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Edge Function URLs
export const edgeFunctions = {
  approveChore: `${supabaseUrl}/functions/v1/approve-chore`,
  checkTimeEstimate: `${supabaseUrl}/functions/v1/check-time-estimate`,
  updateLeaderboard: `${supabaseUrl}/functions/v1/update-leaderboard`,
  processRecurringChores: `${supabaseUrl}/functions/v1/process-recurring-chores`,
}
