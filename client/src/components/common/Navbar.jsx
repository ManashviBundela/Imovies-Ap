import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ backgroundColor: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 1030 }}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              boxShadow: '0 0 15px rgba(225, 29, 72, 0.5)'
            }}
          >
            <i className="bi bi-film fs-5 text-white"></i>
          </div>
          <span className="fw-bold fs-4 tracking-tight">
            I<span style={{ color: '#e11d48' }}>Movies</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <NavLink className="nav-cinema-link d-flex align-items-center gap-2" to="/">
                <i className="bi bi-house-door"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-cinema-link d-flex align-items-center gap-2" to="/movies">
                <i className="bi bi-camera-reels"></i> Movies
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-cinema-link d-flex align-items-center gap-2" to="/my-bookings">
                  <i className="bi bi-ticket-perforated"></i> My Bookings
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  className="nav-cinema-link d-flex align-items-center gap-2 text-warning"
                  to="/admin"
                >
                  <i className="bi bi-shield-lock-fill"></i> Admin Portal
                </NavLink>
              </li>
            )}
          </ul>

          {/* User Auth Section */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light d-flex align-items-center gap-2 py-1 px-3 rounded-pill dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: '#162032' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)',
                      fontSize: '0.8rem'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white fw-medium small">{user.name}</span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg"
                  aria-labelledby="userDropdown"
                  style={{
                    backgroundColor: '#162032',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minWidth: '200px'
                  }}
                >
                  <li className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                    <p className="mb-0 small text-white fw-semibold">{user.name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                      {user.email}
                    </p>
                    <span
                      className={`badge mt-1 ${
                        user.role === 'admin' ? 'bg-danger' : 'bg-primary'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </li>
                  <li>
                    <Link className="dropdown-item text-light py-2" to="/my-bookings">
                      <i className="bi bi-ticket-detailed me-2 text-danger"></i> My Bookings
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item text-warning py-2" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider border-secondary border-opacity-25" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger py-2"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline btn-sm">
                  <i className="bi bi-box-arrow-in-right"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema btn-sm">
                  <i className="bi bi-person-plus"></i> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
