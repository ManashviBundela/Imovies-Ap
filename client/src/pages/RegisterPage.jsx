import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, phone, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Email might already be taken.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '480px' }}>
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
            <h3 className="fw-bold text-white mb-1">Create Account</h3>
            <p className="text-secondary small">Join IMovies for seamless ticket reservations</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">Full Name *</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent text-secondary border-end-0"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
                >
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control cinema-input border-start-0 ps-0"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">Email Address *</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent text-secondary border-end-0"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
                >
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control cinema-input border-start-0 ps-0"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">Phone Number (Optional)</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent text-secondary border-end-0"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
                >
                  <i className="bi bi-telephone"></i>
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control cinema-input border-start-0 ps-0"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control cinema-input"
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small fw-semibold">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control cinema-input"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4 text-secondary small">
            Already registered?{' '}
            <Link to="/login" className="text-danger fw-semibold text-decoration-none">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
