import type { AuditLog, SecurityAlert } from '../types/index.js';
import { supabase } from './supabase.js';

type LogInput = {
  userId?: string;
  action: string;
  status: 'success' | 'failure' | 'info';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
};

function toAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    action: row.action,
    status: row.status,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    details: row.details ?? undefined,
    createdAt: row.created_at
  };
}

function toSecurityAlert(row: any): SecurityAlert {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    severity: row.severity,
    description: row.description,
    resolved: row.resolved,
    createdAt: row.created_at
  };
}

export async function addAuditLog(input: LogInput) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: input.userId ?? null,
    action: input.action,
    status: input.status,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    details: input.details ?? null
  });

  if (error) throw error;
}

export async function addSecurityAlert(input: {
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}) {
  const { error } = await supabase.from('security_alerts').insert({
    user_id: input.userId,
    type: input.type,
    severity: input.severity,
    description: input.description,
    resolved: false
  });

  if (error) throw error;
}

export async function listAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toAuditLog);
}

export async function listAuditLogsByUser(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toAuditLog);
}

export async function listSecurityAlerts(limit = 100) {
  const { data, error } = await supabase
    .from('security_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(toSecurityAlert);
}