import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing. Some functionality may not work properly.');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Store a user's profile image to Supabase Storage
 * @param {string} userId - User's ID
 * @param {Buffer} fileBuffer - Image file buffer
 * @returns {string|null} Public URL of the uploaded file or null on error
 */
export const storeUserProfileImage = async (userId, fileBuffer) => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  
  try {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('wolf-assets')
      .upload(`profile-images/${fileName}`, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading to Supabase:', error);
      return null;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('wolf-assets')
      .getPublicUrl(`profile-images/${fileName}`);
    
    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('Error storing profile image:', error);
    return null;
  }
};

export default supabase;
