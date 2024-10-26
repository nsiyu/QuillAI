import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export const noteService = {
  async createNote(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        title, 
        content,
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(id: string, updates: Partial<Note>) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
