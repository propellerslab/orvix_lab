// types/auth.ts
import { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'b2b_client' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company_name: string | null;
  tax_id: string | null;
  role: UserRole;
  default_shipping_address: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
