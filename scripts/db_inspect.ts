
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wjqvjfpirgyqycmlakgl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcXZqZnBpcmd5cXljbWxha2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDk1OTcsImV4cCI6MjA4MTQ4NTU5N30.RwJHtK9w6E3-XBn9Fy2_8mJ4pY4Vgt8Xoz9Ay3Ldn24';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('Fetching deleted_highlights...');

    // Note: RLS might block this if we are "anon" but don't have a session.
    // But wait, the client usually has a session.
    // Since we are running outside the browser, we might be blocked by RLS policies 
    // that require "auth.uid() = user_id".
    // However, I can try to sign in if needed, but I don't have user credentials.
    // Let's hope RLS allows Select for Anon or we can inspect via a different way.

    // Actually, if RLS is on, this script WILL fail for specific user data unless we sign in.
    // But we can check if the table allows reading generally or if I can use a Service Role Key (I don't have it).

    // Plan B: Just try.
    const { data: tombstones, error: err1 } = await supabase
        .from('deleted_highlights')
        .select('*');

    if (err1) console.error('Error fetching graveyard:', err1);
    else {
        console.log(`Found ${tombstones?.length} entries in graveyard:`);
        tombstones?.forEach(t => console.log(` - ID: ${t.highlight_id} | Text: "${t.text_content?.substring(0, 50)}..." | Deleted: ${t.deleted_at}`));
    }

    console.log('\nFetching highlights (active)...');
    const { data: highlights, error: err2 } = await supabase
        .from('highlights')
        .select('id, text, book_id')
        .limit(10)
        .order('imported_at', { ascending: false });

    if (err2) console.error('Error fetching highlights:', err2);
    else {
        console.log(`Found ${highlights?.length} recent highlights:`);
        highlights?.forEach(h => console.log(` - ID: ${h.id} | Text: "${h.text.substring(0, 50)}..."`));
    }
}

run();
