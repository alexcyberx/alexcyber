'use client';

import { useEffect } from 'react';
import { browserSupabase } from '@/lib/supabase';

// Fire-and-forget view increment, same RPC the old page called.
export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const sb = browserSupabase();
    if (sb) sb.rpc('blog_increment_views', { p_slug: slug }).then(() => {}, () => {});
  }, [slug]);
  return null;
}
