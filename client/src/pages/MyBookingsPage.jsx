import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);

    try {
      const res = await api.put(`/api/bookings/${cancelModalBooking._id}/cancel`, {
        reason: cancelReason
      });

      if (res.data.success) {
        alert('Booking cancelled successfully! Your seats have been released.');
        setCancelModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your cinema passes..." />;
  }

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-white fw-bold display-6 mb-1">My Bookings</h1>
          <p className="text-secondary small mb-0">
            View your active movie passes, past bookings, and manage cancellations.
          </p>
        </div>
        <Link to="/movies" className="btn btn-cinema btn-sm">
          <i className="bi bi-plus-circle"></i> Book New Movie
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger cinema-card p-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-secondary"
            style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <i className="bi bi-ticket-perforated fs-1"></i>
          </div>
          <h4 className="text-white fw-semibold mb-2">No Bookings Found</h4>
          <p className="text-secondary small mb-4">
            You haven't reserved any movie tickets yet. Pick a blockbuster to get started!
          </p>
          <Link to="/movies" className="btn btn-cinema">
            Browse Movies Now
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            return (
              <div className="col-12" key={booking._id}>
                <div
                  className="p-4 rounded-4 cinema-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4"
                  style={{
                    backgroundColor: '#162032',
                    borderLeft: isConfirmed ? '4px solid #22c55e' : '4px solid #ef4444'
                  }}
                >
                  {/* Left: Movie & Cinema Info */}
                  <div className="d-flex gap-3 align-items-center">
                    <img
                      src={booking.movie?.posterUrl}
                      alt={booking.movie?.title}
                      className="rounded-3 shadow"
                      style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                      }}
                    />

                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className={`badge ${
                            isConfirmed ? 'bg-success bg-opacity-25 text-success border border-success border-opacity-50' : 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50'
                          }`}
                        >
                          {isConfirmed ? 'Confirmed' : 'Cancelled'}
                        </span>
                        <span className="text-muted small">
                          Ref: <strong className="text-white">{booking.bookingReference}</strong>
                        </span>
                      </div>

                      <h4 className="text-white fw-bold mb-1">{booking.movie?.title}</h4>
                      <p className="text-secondary small mb-1">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        {booking.cinema?.name} ({booking.cinema?.location}) • Screen {booking.screenNumber || 1}
                      </p>
                      <div className="text-muted small">
                        <i className="bi bi-calendar3 me-1 text-danger"></i> {booking.showDate} at{' '}
                        <strong className="text-white">{booking.showTime}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Seats & Payment */}
                  <div className="border-start border-secondary border-opacity-25 ps-md-4">
                    <div className="text-secondary small mb-1">Seats Reserved:</div>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {booking.seatNumbers.map((sn) => (
                        <span key={sn} className="badge bg-dark border border-secondary text-white">
                          {sn}
                        </span>
                      ))}
                    </div>
                    <div className="text-secondary small">
                      Total: <span className="text-white fw-bold fs-6">₹{booking.totalAmount}</span>
                      <span className="text-muted ms-2" style={{ fontSize: '0.75rem' }}>
                        ({booking.paymentDetails?.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <Link
                      to={`/booking-confirmation/${booking._id}`}
                      className="btn btn-cinema btn-sm"
                    >
                      <i className="bi bi-qr-code"></i> View Ticket
                    </Link>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancelModalBooking(booking)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <i className="bi bi-x-circle"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelModalBooking && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: '#162032', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-octagon me-2"></i> Cancel Ticket Booking
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCancelModalBooking(null)}
                  disabled={cancelling}
                ></button>
              </div>

              <div className="modal-body">
                <p className="text-light mb-2">
                  Are you sure you want to cancel booking for{' '}
                  <strong className="text-white">{cancelModalBooking.movie?.title}</strong>?
                </p>
                <div className="p-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-3 small text-secondary">
                  <div>Seats: {cancelModalBooking.seatNumbers.join(', ')}</div>
                  <div>Show: {cancelModalBooking.showDate} at {cancelModalBooking.showTime}</div>
                  <div className="text-white fw-semibold mt-1">
                    Refund Amount: ₹{cancelModalBooking.totalAmount}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Reason for cancellation</label>
                  <select
                    className="form-select cinema-input"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Booked by mistake">Booked by mistake</option>
                    <option value="Showtime conflict">Showtime conflict</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-info-circle text-warning me-1"></i> Cancelling releases your reserved seats immediately for other moviegoers.
                </p>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCancelModalBooking(null)}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={cancelling}
                  className="btn btn-danger btn-sm"
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
