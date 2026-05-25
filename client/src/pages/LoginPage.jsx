import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import '../styles/auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Intentional gap: no client-side validation before hitting the API
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data);
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/talent/dashboard');
      }
    } catch (error) {
      // Intentional gap: using alert() instead of a proper toast/error component
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#grad1)" />
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-title">Task Pipeline</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Intentional gap: no "Forgot password?" link */}
          </div>

          <button type="submit" className="auth-btn">
            Sign In
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="visual-content">
          <h2>Manage Tasks,<br />Streamline Talent.</h2>
          <p>Assign, track, and complete tasks across your entire talent pool — all in one place.</p>
          <div className="visual-stats">
            <div className="stat">
              <span className="stat-num">98%</span>
              <span className="stat-label">Task Completion</span>
            </div>
            <div className="stat">
              <span className="stat-num">3x</span>
              <span className="stat-label">Faster Onboarding</span>
            </div>
            <div className="stat">
              <span className="stat-num">500+</span>
              <span className="stat-label">Talents Managed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
