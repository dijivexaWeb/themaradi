const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qcxsqirqlepjebkezgud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeHNxaXJxbGVwamVia2V6Z3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2MDA1NCwiZXhwIjoyMDk2MzM2MDU0fQ.JnemTLKrD7AjhHsBXwjSmKTfA-6n2dhRmKmWLDaKYes';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const vaultId = '35dc2d67-b36a-407e-8f19-0fb9fc792ef5';

  // Memories
  const { data: memories } = await supabase.from('vault_memories').select('id, is_secret, section, title').eq('vault_id', vaultId);
  console.log('Memories found:', memories?.length ?? 0);
  memories?.forEach(m => console.log(`  - Title: "${m.title}", Section: "${m.section}", IsSecret: ${m.is_secret}`));

  // Guestbook
  const { data: guestbook } = await supabase.from('guestbook_entries').select('id, status, author_name').eq('vault_id', vaultId);
  console.log('Guestbook entries found:', guestbook?.length ?? 0);
  guestbook?.forEach(g => console.log(`  - Author: "${g.author_name}", Status: "${g.status}"`));

  // Media
  const { data: media } = await supabase.from('media').select('id, media_type, is_public, original_filename').eq('vault_id', vaultId);
  console.log('Media found:', media?.length ?? 0);
  media?.forEach(m => console.log(`  - Name: "${m.original_filename}", Type: "${m.media_type}", IsPublic: ${m.is_public}`));
}

run();
