import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ContactChannel {
  id: string;
  label: string;
  slug: string;
  url: string;
  icon?: string;
  type: 'email' | 'linkedin' | 'twitter' | 'github' | 'other';
}

export function useContactChannels() {
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data, error } = await supabase
          .from('contact_channels')
          .select('id, label, slug, url, icon, type')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setChannels(data || []);
      } catch (err) {
        console.error('Error fetching contact channels:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  return { channels, loading };
}
