import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { FiEdit2, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

function Profile() {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    username: null,
    full_name: null,
    avatar_url: null,
    updated_at: null
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      if (!session?.user) throw new Error('No user');

      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { 
        throw error;
      }

      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } else {
        const defaultProfile = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || null,
          full_name: null,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile]);

        if (insertError) throw insertError;
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user) throw new Error('No user');

      setLoading(true);
      const updates = {
        id: session.user.id,
        username: profile?.username,
        full_name: profile?.full_name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      if (avatar) {
        // Delete old avatar if it exists
        if (profile?.avatar_url) {
          const oldAvatarPath = profile.avatar_url.split('/').pop();
          if (oldAvatarPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${session.user.id}/${oldAvatarPath}`]);
          }
        }

        // Upload new avatar
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: data.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;
        setAvatarUrl(data.publicUrl);
      }

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-jet">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-2 py-12">
        <div className="max-w-xl mx-auto bg-white/30 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="text-jet/70 hover:text-maya transition-colors"
              >
                <FiArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-bold text-jet">Profile</h1>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-maya hover:text-maya/80 transition-colors"
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-pink hover:text-pink/80 transition-colors"
              >
                <FiX /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={updateProfile} className="space-y-6">
            <div className="flex items-center gap-8">
              <div className="relative">
                <img
                  src={avatarUrl || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-jet mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    onChange={(e) => setProfile({ ...profile!, username: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-white/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-jet mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-2 bg-white/50 border border-maya/20 rounded-lg focus:outline-none focus:border-maya disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-maya text-white rounded-lg hover:bg-maya/90 transition-all disabled:opacity-50"
                >
                  <FiSave />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
