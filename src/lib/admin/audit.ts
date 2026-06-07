import { createServiceClient } from '@/lib/supabase/server'

interface AuditParams {
  adminId: string
  adminEmail: string
  action: string
  entityType: string
  entityId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
}

export async function logAdminAction(params: AuditParams) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('admin_audit_logs').insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
    })
  } catch {
    // Audit log failure should NOT break admin operations
    console.error('[AUDIT] Failed to log admin action:', params.action)
  }
}
