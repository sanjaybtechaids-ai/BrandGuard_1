import { createClient as createServerClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/supabase/client';

export type AuditAction =
  | 'URL_VERIFIED'
  | 'BRAND_CREATED'
  | 'BRAND_UPDATED'
  | 'BRAND_DISCOVERY_STARTED'
  | 'BRAND_DISCOVERY_COMPLETED'
  | 'BRAND_DISCOVERY_FAILED'
  | 'OFFICIAL_DOMAIN_ADDED'
  | 'OFFICIAL_APP_ADDED'
  | 'OFFICIAL_SOCIAL_ADDED'
  | 'IDENTITY_REFRESHED'
  | 'SCAN_STARTED'
  | 'SCAN_COMPLETED'
  | 'THREAT_CREATED'
  | 'THREAT_UPDATED'
  | 'THREAT_RESOLVED'
  | 'REPORT_GENERATED'
  | 'USER_INVITED'
  | 'ROLE_CHANGED';

export interface AuditLogEntry {
  id?: string;
  organizationId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

// In-memory buffer for local inspection / demo
export const localAuditLogs: AuditLogEntry[] = [];

/**
 * Sanitizes metadata to guarantee credentials or tokens are never logged.
 */
function sanitizeMetadata(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {};
  const cleaned: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'auth', 'cookie'];

  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      cleaned[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      cleaned[k] = sanitizeMetadata(v as Record<string, unknown>);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  const sanitized = {
    ...entry,
    metadata: sanitizeMetadata(entry.metadata),
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode()) {
    localAuditLogs.unshift(sanitized);
    if (localAuditLogs.length > 200) localAuditLogs.pop();
  }

  // If Supabase is connected, persist to audit_logs table
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const { error } = await supabase.from('audit_logs').insert({
        organization_id: entry.organizationId,
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        metadata: sanitized.metadata,
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch {
      // Audit failures must not expose sensitive event metadata to clients.
    }
  }
}
