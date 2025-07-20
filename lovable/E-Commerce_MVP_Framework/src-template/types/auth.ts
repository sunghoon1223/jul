import { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Add any custom user properties here
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}