import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Ziyanda Dyani');
  const [email, setEmail] = useState('ziyada@example.com');
  const [password, setPassword] = useState('Secure123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ fullName, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <p className="muted">Password must be at least 8 characters and include upper, lower, number, and special character.</p>
        {error && <div className="alert error">{error}</div>}
        <button disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
