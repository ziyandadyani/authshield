import type { User } from '../types/index.js';
import { supabase } from './supabase.js';

function toUser(row: any): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    isLocked: row.is_locked,
    failedLoginCount: row.failed_login_count,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at
  };
}

function toUserInsert(user: User) {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    is_locked: user.isLocked,
    failed_login_count: user.failedLoginCount,
    last_login_at: user.lastLoginAt ?? null,
    created_at: user.createdAt
  };
}

export function publicUser(user: User) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data ? toUser(data) : null;
}

export async function findUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toUser(data) : null;
}

export async function createUser(user: User) {
  const { data, error } = await supabase
    .from('users')
    .insert(toUserInsert(user))
    .select('*')
    .single();

  if (error) throw error;
  return toUser(data);
}

export async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toUser);
}

export async function updateUserLoginState(
  id: string,
  updates: Partial<Pick<User, 'failedLoginCount' | 'isLocked' | 'lastLoginAt'>>
) {
  const payload: Record<string, unknown> = {};

  if (updates.failedLoginCount !== undefined) payload.failed_login_count = updates.failedLoginCount;
  if (updates.isLocked !== undefined) payload.is_locked = updates.isLocked;
  if (updates.lastLoginAt !== undefined) payload.last_login_at = updates.lastLoginAt;

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return toUser(data);
}