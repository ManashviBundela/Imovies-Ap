import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="footer mt-auto pt-5 pb-4"
      style={{
        backgroundColor: '#060910',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        <div className="row g-4 pb-4 border-bottom border-secondary border-opacity-25">
          {/* Brand & Mission */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '34px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'
                }}
              >
                <i className="bi bi-film text-white"></i>
              </div>
              <span className="fw-bold fs-4 text-white">
                I<span style={{ color: '#e11d48' }}>Movies</span>
              </span>
            </div>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.7' }}>
              Movie Ticket Booking Made Simple. Discover the latest blockbusters, experience
              IMAX and 4DX audio-visuals, pick your favorite cinema seats, and enjoy seamless
              digital ticketing anytime, anywhere.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2" aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small tracking-wider">
              Quick Links
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/" className="text-secondary text-decoration-none hover-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-secondary text-decoration-none hover-white">
                  All Movies
                </Link>
              </li>
              <li>
                <Link to="/movies?status=Now Showing" className="text-secondary text-decoration-none hover-white">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=Upcoming" className="text-secondary text-decoration-none hover-white">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-secondary text-decoration-none hover-white">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Cinema Formats */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small tracking-wider">
              Experiences
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li className="text-secondary">
                <i className="bi bi-badge-hd text-danger me-2"></i> IMAX with Laser
              </li>
              <li className="text-secondary">
                <i className="bi bi-badge-4k text-danger me-2"></i> Dolby Atmos Sound 12.1
              </li>
              <li className="text-secondary">
                <i className="bi bi-badge-3d text-danger me-2"></i> 4DX Motion Experience
              </li>
              <li className="text-secondary">
                <i className="bi bi-gem text-danger me-2"></i> Royal Gold Class Recliners
              </li>
              <li className="text-secondary">
                <i className="bi bi-cup-straw text-danger me-2"></i> In-seat Dining & Café
              </li>
            </ul>
          </div>

          {/* Security & Project Badge */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small tracking-wider">
              College Capstone
            </h6>
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-danger">MERN Stack</span>
                <span className="badge bg-secondary">REST API</span>
              </div>
              <p className="text-muted small mb-0">
                Built with React, Express, Node.js, and MongoDB with atomic seat reservations and JWT security.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4 small text-secondary">
          <p className="mb-2 mb-md-0">
            © {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <span className="text-muted">Privacy Policy</span>
            <span className="text-muted">•</span>
            <span className="text-muted">Terms of Service</span>
            <span className="text-muted">•</span>
            <span className="text-muted">Booking FAQ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
