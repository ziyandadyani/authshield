import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { AuditLog } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await api.get<{ logs: AuditLog[] }>('/api/user/activity');
        setActivity(data.logs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      }
    }

    loadActivity();
  }, []);

  return (
    <Layout>
      <section className="grid two-col">
        <div className="card">
          <h2>Profile</h2>
          <p><strong>Name:</strong> {user?.fullName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Account locked:</strong> {user?.isLocked ? 'Yes' : 'No'}</p>
          <p><strong>Failed logins:</strong> {user?.failedLoginCount}</p>
          <p><strong>Last login:</strong> {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}</p>
        </div>

        {/* <div className="card">
          <h2>Security summary</h2>
          <ul>
            <li>JWT-based authentication</li>
            <li>bcrypt password hashing</li>
            <li>Login rate limiting</li>
            <li>Audit logging</li>
            <li>Account lockout after repeated failures</li>
          </ul>
        </div> */}
      </section>

      <section className="card table-card">
        <h2>Recent activity</h2>
        {error && <div className="alert error">{error}</div>}
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Status</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((log) => (
              <tr key={log.id}>
                <td>{log.action}</td>
                <td>{log.status}</td>
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
