import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '65vh' }}>
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
        style={{ width: '80px', height: '80px', background: 'rgba(225, 29, 72, 0.15)', color: '#e11d48' }}
      >
        <i className="bi bi-camera-reels-fill display-4"></i>
      </div>
      <h1 className="display-4 fw-extrabold text-white mb-2">404</h1>
      <h4 className="text-secondary mb-3">Scene Not Found</h4>
      <p className="text-muted small mb-4" style={{ maxWidth: '420px' }}>
        The cinema page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-cinema">
        <i className="bi bi-house-door-fill me-1"></i> Return to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
