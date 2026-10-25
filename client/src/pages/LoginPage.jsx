import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destination after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for presentation demonstration
  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div
          className="p-4 p-md-5 rounded-4 shadow-2xl cinema-card"
          style={{ backgroundColor: '#162032' }}
        >
          {/* Logo Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2"
              style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                boxShadow: '0 0 20px rgba(225, 29, 72, 0.4)'
              }}
            >
              <i className="bi bi-film fs-4 text-white"></i>
            </div>
            <h3 className="fw-bold text-white mb-1">Welcome Back</h3>
            <p className="text-secondary small">Sign in to your IMovies account</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">Email Address</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent text-secondary border-end-0"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
                >
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control cinema-input border-start-0 ps-0"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small fw-semibold">Password</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent text-secondary border-end-0"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
                >
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control cinema-input border-start-0 ps-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cinema w-100 py-2 fw-semibold"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* 1-Click Demo Buttons for Evaluation */}
          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
            <span className="text-muted d-block small mb-2 text-center" style={{ fontSize: '0.75rem' }}>
              Quick Demo Accounts (1-Click Fill):
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@imovies.com', 'Admin@123')}
                className="btn btn-outline-warning btn-sm flex-grow-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-shield-lock"></i> Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('alex@example.com', 'Password@123')}
                className="btn btn-outline-info btn-sm flex-grow-1"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-person"></i> Customer
              </button>
            </div>
          </div>

          <div className="text-center mt-4 text-secondary small">
            Don't have an account?{' '}
            <Link to="/register" className="text-danger fw-semibold text-decoration-none">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
