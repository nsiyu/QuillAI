import { supabase } from '../lib/supabase';

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    return data;
  }
};
