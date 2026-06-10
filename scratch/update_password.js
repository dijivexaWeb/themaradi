const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qcxsqirqlepjebkezgud.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeHNxaXJxbGVwamVia2V6Z3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2MDA1NCwiZXhwIjoyMDk2MzM2MDU0fQ.JnemTLKrD7AjhHsBXwjSmKTfA-6n2dhRmKmWLDaKYes';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const ownerId = '672e474a-5b11-480a-a0b1-3624efa93aab';
  console.log('Updating password to Akif2543 for user:', ownerId);

  const { data, error } = await supabase.auth.admin.updateUserById(
    ownerId,
    { password: 'Akif2543' }
  );

  if (error) {
    console.error('Update password error:', error);
    return;
  }

  console.log('Password updated successfully for user:', data.user.email);
}

main();
