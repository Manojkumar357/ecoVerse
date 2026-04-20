import { createClient } from '@supabase/supabase-js'

// Get environment variables from Vite inject or import.meta.env
declare const __VITE_ENV__: Record<string, string>

const getEnvVar = (key: string): string | undefined => {
  // Try import.meta.env first (production/build)
  if (import.meta.env[key as any]) {
    return import.meta.env[key as any]
  }
  // Try __VITE_ENV__ (development, loaded from .env)
  if (typeof __VITE_ENV__ !== "undefined" && __VITE_ENV__[key]) {
    return __VITE_ENV__[key]
  }
  return undefined
}

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL")
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY")

let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log("✅ Supabase configured successfully")
} else {
  console.warn("⚠️ Supabase credentials not configured. Google Sign-In will not work.")
}

export { supabase }

// Google Sign-in function
export const signInWithGoogle = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

// Sign out function
export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Get current session
export const getCurrentUser = async () => {
  if (!supabase) {
    return null
  }
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Watch auth state changes
export const onAuthStateChange = (
  callback: (user: any) => void
) => {
  if (!supabase) {
    console.warn('Supabase is not configured. Auth state changes will not be monitored.')
    return { unsubscribe: () => {} }
  }
  
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event: any, session: any) => {
    callback(session?.user || null)
  })

  return subscription
}
