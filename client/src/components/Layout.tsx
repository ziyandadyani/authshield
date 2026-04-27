import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/shield.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <div className="nav-box" >
        <header className="topbar" style={{ maxWidth: "1080px", margin: "0 auto" }}>

          <div className="logo">
            <img src={logo} alt="logo" style={{ width: "50px" }} />
            <h1 style={{ fontSize: "20px", marginLeft: "1em" }}>AuthShield</h1>
          </div>



          <nav className="nav-links">
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                {user.role === 'admin' && <Link to="/admin">Admin</Link>}
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
      </div>

      <main className="page-container">{children}</main>
    </div>
  );
}
