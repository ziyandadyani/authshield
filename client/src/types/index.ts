export type User = {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isLocked: boolean;
  failedLoginCount: number;
  lastLoginAt?: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  userId?: string;
  action: string;
  status: 'success' | 'failure' | 'info';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: string;
};

export type Alert = {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
  createdAt: string;
};
