const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qcxsqirqlepjebkezgud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeHNxaXJxbGVwamVia2V6Z3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2MDA1NCwiZXhwIjoyMDk2MzM2MDU0fQ.JnemTLKrD7AjhHsBXwjSmKTfA-6n2dhRmKmWLDaKYes';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const vaultId = '35dc2d67-b36a-407e-8f19-0fb9fc792ef5';

  const { data: vault, error: vaultError } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', vaultId)
    .single();

  if (vaultError) {
    console.error('Vault error:', vaultError);
    return;
  }
  console.log('Vault Details:', vault);

  // 1. Check all memories
  const { data: memories, error: memError } = await supabase
    .from('vault_memories')
    .select('*')
    .eq('vault_id', vaultId);

  console.log('\n--- ALL VAULT MEMORIES ---');
  if (memError) {
    console.error(memError);
  } else {
    console.log(memories);
  }

  // 2. Check all guestbook entries
  const { data: guestbook, error: gbError } = await supabase
    .from('guestbook_entries')
    .select('*')
    .eq('vault_id', vaultId);

  console.log('\n--- ALL GUESTBOOK ENTRIES ---');
  if (gbError) {
    console.error(gbError);
  } else {
    console.log(guestbook);
  }

  // 3. Check all media
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', vaultId);

  console.log('\n--- ALL MEDIA ---');
  if (mediaError) {
    console.error(mediaError);
  } else {
    console.log(media);
  }

  // 4. Check all family members
  const { data: family, error: famError } = await supabase
    .from('vault_family_members')
    .select('*')
    .eq('vault_id', vaultId);

  console.log('\n--- ALL FAMILY MEMBERS ---');
  if (famError) {
    console.error(famError);
  } else {
    console.log(family);
  }
}

run();
