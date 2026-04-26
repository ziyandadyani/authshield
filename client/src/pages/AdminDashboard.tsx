import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { Alert, AuditLog, User } from '../types';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [usersData, logsData, alertsData] = await Promise.all([
        api.get<{ users: User[] }>('/api/admin/users'),
        api.get<{ logs: AuditLog[] }>('/api/admin/logs'),
        api.get<{ alerts: Alert[] }>('/api/admin/alerts')
      ]);

      setUsers(usersData.users);
      setLogs(logsData.logs);
      setAlerts(alertsData.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleLock(userId: string, locked: boolean) {
    try {
      await api.patch(`/api/admin/users/${userId}/${locked ? 'unlock' : 'lock'}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  }

  return (
    <Layout>
      {error && <div className="alert error">{error}</div>}

      <section className="grid three-col">
        <div className="card stat-card"><h3>Total users</h3><p>{users.length}</p></div>
        <div className="card stat-card"><h3>Open alerts</h3><p>{alerts.filter((a) => !a.resolved).length}</p></div>
        <div className="card stat-card"><h3>Audit entries</h3><p>{logs.length}</p></div>
      </section>

      <section className="card table-card">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Failed logins</th>
              <th>Locked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.failedLoginCount}</td>
                <td>{user.isLocked ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleLock(user.id, user.isLocked)}>
                    {user.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card table-card">
        <h2>Security alerts</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Resolved</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{alert.type}</td>
                <td>{alert.severity}</td>
                <td>{alert.description}</td>
                <td>{alert.resolved ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card table-card">
        <h2>Audit logs</h2>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Status</th>
              <th>IP</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.status}</td>
                <td>{log.ipAddress || '-'}</td>
                <td>{log.details || '-'}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
