import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.newBooking || null);
  const [loading, setLoading] = useState(!location.state?.newBooking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/api/bookings/${bookingId}`);
          if (res.data.success) {
            setBooking(res.data.booking);
          }
        } catch (err) {
          console.error('Error fetching booking confirmation:', err);
          setError('Booking record not found or unauthorized.');
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [bookingId, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating digital cinema pass..." />;
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger cinema-card p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h4>Booking Not Found</h4>
          <p className="text-secondary small">{error || 'Unable to locate ticket record.'}</p>
          <Link to="/movies" className="btn btn-cinema btn-sm">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  const {
    bookingReference,
    movie,
    cinema,
    seatNumbers = [],
    screenNumber,
    showDate,
    showTime,
    totalAmount,
    paymentDetails,
    createdAt
  } = booking;

  return (
    <div className="container py-5 pb-5">
      {/* Success Banner */}
      <div className="text-center mb-4 no-print">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '68px', height: '68px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
        >
          <i className="bi bi-check-circle-fill display-5"></i>
        </div>
        <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small">
          Your e-tickets have been successfully issued. Show this digital pass at the cinema entrance.
        </p>
      </div>

      {/* Ticket Pass Container */}
      <div className="mx-auto" style={{ maxWidth: '560px' }}>
        <div className="ticket-stub p-4 p-md-5 text-white">
          <div className="ticket-notch-left"></div>
          <div className="ticket-notch-right"></div>

          {/* Top Pass Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2"
                style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
              >
                <i className="bi bi-film fs-6 text-white"></i>
              </div>
              <span className="fw-bold tracking-tight">
                I<span style={{ color: '#e11d48' }}>Movies</span> PASS
              </span>
            </div>
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1">
              Confirmed
            </span>
          </div>

          {/* Movie Details */}
          <div className="d-flex gap-3 mb-4">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="rounded-3 shadow"
                style={{ width: '80px', height: '115px', objectFit: 'cover' }}
              />
            )}
            <div>
              <h4 className="fw-bold text-white mb-1">{movie?.title}</h4>
              <p className="text-secondary small mb-2">
                {movie?.certificate || 'UA'} • {movie?.language || 'English'}
              </p>
              <div className="badge bg-danger bg-opacity-20 text-danger border border-danger border-opacity-50 small">
                Reference: <strong className="text-white">{bookingReference}</strong>
              </div>
            </div>
          </div>

          {/* Ticket Information Grid */}
          <div className="row g-3 py-2 text-secondary small">
            <div className="col-6">
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                Cinema
              </span>
              <strong className="text-white">{cinema?.name}</strong>
              <div style={{ fontSize: '0.75rem' }}>{cinema?.location}</div>
            </div>
            <div className="col-6 text-end">
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                Screen
              </span>
              <strong className="text-white">Screen {screenNumber || 1}</strong>
            </div>

            <div className="col-6">
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                Date & Time
              </span>
              <strong className="text-white">{showDate}</strong>
              <div className="text-danger fw-semibold">{showTime}</div>
            </div>
            <div className="col-6 text-end">
              <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                Seats ({seatNumbers.length})
              </span>
              <strong className="text-white fs-6">{seatNumbers.join(', ')}</strong>
            </div>
          </div>

          {/* Divider */}
          <div className="ticket-divider"></div>

          {/* Bottom Barcode / QR Simulation & Total */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="d-block text-muted small" style={{ fontSize: '0.75rem' }}>
                Total Paid
              </span>
              <span className="fs-4 fw-extrabold text-white">₹{totalAmount}</span>
              <span className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                Method: {paymentDetails?.method || 'Card'}
              </span>
            </div>

            {/* QR Mockup */}
            <div className="text-center">
              <div
                className="p-2 rounded bg-white d-inline-block shadow-sm"
                style={{ width: '84px', height: '84px' }}
              >
                {/* SVG QR Code pattern */}
                <svg viewBox="0 0 100 100" width="68" height="68">
                  <path
                    fill="#000"
                    d="M10 10h30v30h-30z M15 15h20v20h-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15h20v20h-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65h20v20h-20z M20 70h10v10h-10z M50 10h5v10h-5z M50 30h10v10h-10z M60 50h10v10h-10z M80 50h10v15h-10z M50 60h5v30h-5z M60 70h10v10h-10z M80 80h10v10h-10z M70 60h10v5h-10z M65 85h25v5h-25z"
                  />
                </svg>
              </div>
              <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>
                Scan at Gate
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="d-flex flex-column flex-sm-row gap-3 mt-4 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-cinema flex-grow-1 py-2"
          >
            <i className="bi bi-printer-fill"></i> Print / Save Ticket
          </button>
          <Link
            to="/my-bookings"
            className="btn btn-cinema-outline flex-grow-1 py-2 text-center"
          >
            <i className="bi bi-ticket-detailed"></i> View in My Bookings
          </Link>
          <Link
            to="/movies"
            className="btn btn-outline-secondary py-2 text-center"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
