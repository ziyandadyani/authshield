import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: JSX.Element;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="centered">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/unauthorized" replace />;

  return children;
}
