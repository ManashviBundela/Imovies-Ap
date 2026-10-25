import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seat numbers e.g. ['C4', 'C5']
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflictError, setConflictError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [showModal, setShowModal] = useState(false);

  // Fetch showtime and live seat status
  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/showtimes/${showtimeId}`);
      if (res.data.success) {
        setShowtime(res.data.showtime);
      }
    } catch (err) {
      console.error('Error loading showtime:', err);
      setError('Could not load seat map. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  if (loading) {
    return <LoadingSpinner message="Rendering cinema screen & seats..." />;
  }

  if (error || !showtime) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger cinema-card p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h4>Unable to Load Showtime</h4>
          <p className="text-secondary small">{error || 'Showtime was not found.'}</p>
          <Link to="/movies" className="btn btn-cinema btn-sm">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const { movie, cinema, screen, tierPricing, bookedSeatNumbers = [] } = showtime;

  // Screen layout rows and columns
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Helper to get tier and price for a seat
  const getSeatTierAndPrice = (seatNumber) => {
    const rowChar = seatNumber.charAt(0).toUpperCase();
    if (['A', 'B'].includes(rowChar)) {
      return { tier: 'Silver', price: tierPricing?.silver || 180 };
    }
    if (['E', 'F'].includes(rowChar)) {
      return { tier: 'VIP', price: tierPricing?.vip || 420 };
    }
    return { tier: 'Gold', price: tierPricing?.gold || 280 };
  };

  // Toggle seat selection
  const handleSeatClick = (seatNumber) => {
    setConflictError(null);

    // If already booked by someone else
    if (bookedSeatNumbers.includes(seatNumber)) {
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Pricing calculations
  const calculateTotals = () => {
    let subtotal = 0;
    const seatItems = selectedSeats.map((sn) => {
      const { tier, price } = getSeatTierAndPrice(sn);
      subtotal += price;
      return { seatNumber: sn, tier, price };
    });

    const convenienceFee = selectedSeats.length * 20;
    const taxes = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + convenienceFee + taxes;

    return { seatItems, subtotal, convenienceFee, taxes, totalAmount };
  };

  const { seatItems, subtotal, convenienceFee, taxes, totalAmount } = calculateTotals();

  // Handle Checkout / Booking Submission
  const handleProceedToBook = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/seats/${showtimeId}` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    setConflictError(null);

    try {
      const payload = {
        showtimeId: showtime._id,
        seats: seatItems,
        paymentMethod
      };

      const res = await api.post('/api/bookings', payload);

      if (res.data.success) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const bookingId = res.data.booking._id;
        navigate(`/booking-confirmation/${bookingId}`, {
          state: { newBooking: res.data.booking }
        });
      }
    } catch (err) {
      console.error('Booking failed:', err);
      if (err.response && err.response.status === 409) {
        // Seat conflict! Another user booked simultaneously
        setConflictError(
          err.response.data.message || 'One or more of your chosen seats were just booked. Please pick another seat.'
        );
        setShowModal(false);
        // Refresh live availability
        fetchShowtime();
        setSelectedSeats([]);
      } else {
        alert(err.response?.data?.message || 'Failed to complete booking. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container py-4 pb-5">
      {/* Top Breadcrumb & Showtime Info Header */}
      <div
        className="p-3 p-md-4 rounded-4 mb-4"
        style={{ backgroundColor: '#162032', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link to={`/movies/${movie._id}`} className="text-secondary small text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i> {movie.title}
              </Link>
              <span className="text-muted">•</span>
              <span className="badge-format">{showtime.format}</span>
            </div>
            <h2 className="text-white fw-bold mb-1">{movie.title}</h2>
            <p className="text-secondary small mb-0">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> {cinema.name} ({cinema.location}) • Screen {showtime.screenNumber}
            </p>
          </div>

          <div className="text-md-end bg-dark bg-opacity-50 p-3 rounded-3 border border-secondary border-opacity-25">
            <div className="text-secondary small">Selected Showtime</div>
            <div className="text-white fw-bold fs-5">
              {showtime.startTime}
            </div>
            <div className="text-muted small">
              {new Date(showtime.showDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {conflictError && (
        <div className="alert alert-danger cinema-card d-flex align-items-center gap-3 mb-4">
          <i className="bi bi-exclamation-triangle-fill fs-3 text-danger"></i>
          <div>
            <h6 className="fw-bold mb-0 text-white">Seat Conflict Detected!</h6>
            <span className="small text-danger-subtle">{conflictError}</span>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Visual Cinema Seating Area */}
        <div className="col-lg-8">
          <div
            className="p-4 rounded-4 cinema-card text-center"
            style={{ backgroundColor: '#0b1120' }}
          >
            {/* Screen representation */}
            <div className="cinema-screen-container">
              <div className="cinema-screen-curve"></div>
              <div className="cinema-screen-text">All Eyes This Way • Cinema Screen</div>
            </div>

            {/* Seating Grid */}
            <div className="d-flex flex-column gap-3 py-3 align-items-center overflow-auto">
              {rows.map((row) => {
                const isSilver = ['A', 'B'].includes(row);
                const isVIP = ['E', 'F'].includes(row);
                const tierName = isVIP ? 'VIP Recliner' : isSilver ? 'Silver' : 'Gold Class';
                const tierClass = isVIP ? 'vip-tier' : isSilver ? 'silver-tier' : 'gold-tier';

                return (
                  <div key={row} className="d-flex align-items-center gap-2">
                    {/* Row Letter Left */}
                    <span
                      className="text-muted fw-bold small text-center"
                      style={{ width: '22px' }}
                    >
                      {row}
                    </span>

                    {/* Seats in row */}
                    <div className="d-flex gap-2">
                      {cols.map((col) => {
                        const seatNumber = `${row}${col}`;
                        const isBooked = bookedSeatNumbers.includes(seatNumber);
                        const isSelected = selectedSeats.includes(seatNumber);

                        return (
                          <React.Fragment key={seatNumber}>
                            <button
                              type="button"
                              onClick={() => handleSeatClick(seatNumber)}
                              disabled={isBooked}
                              title={`${seatNumber} (${tierName}) ${isBooked ? ' - Already Booked' : ''}`}
                              className={`seat-btn ${tierClass} ${
                                isSelected ? 'selected' : isBooked ? 'booked' : ''
                              }`}
                            >
                              {col}
                            </button>
                            {/* Gangway aisle gap after seat 5 */}
                            {col === 5 && <div style={{ width: '20px' }}></div>}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Letter Right */}
                    <span
                      className="text-muted fw-bold small text-center"
                      style={{ width: '22px' }}
                    >
                      {row}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Seating Legend */}
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 pt-4 mt-3 border-top border-secondary border-opacity-25 small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <div className="seat-btn" style={{ width: '22px', height: '22px', cursor: 'default' }}></div>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn selected"
                  style={{ width: '22px', height: '22px', cursor: 'default' }}
                ></div>
                <span className="text-white fw-medium">Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn booked"
                  style={{ width: '22px', height: '22px', cursor: 'default' }}
                ></div>
                <span>Booked</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge px-2 py-1"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}
                >
                  VIP: ₹{tierPricing?.vip || 420}
                </span>
                <span
                  className="badge px-2 py-1"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}
                >
                  Gold: ₹{tierPricing?.gold || 280}
                </span>
                <span
                  className="badge px-2 py-1"
                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1' }}
                >
                  Silver: ₹{tierPricing?.silver || 180}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Price Breakdown & Checkout Card */}
        <div className="col-lg-4">
          <div
            className="p-4 rounded-4 cinema-card"
            style={{ backgroundColor: '#162032' }}
          >
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-receipt text-danger"></i> Booking Summary
            </h5>

            {/* Selected Seats Chips */}
            <div className="mb-3">
              <span className="text-secondary small d-block mb-2">Selected Seats:</span>
              {selectedSeats.length === 0 ? (
                <div className="p-3 text-center rounded-3 border border-secondary border-opacity-25 text-muted small">
                  No seats selected yet. Click on the layout to pick seats.
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.map((sn) => {
                    const { tier, price } = getSeatTierAndPrice(sn);
                    return (
                      <span
                        key={sn}
                        className="badge bg-danger bg-opacity-20 border border-danger border-opacity-50 text-white px-2 py-1 d-flex align-items-center gap-2"
                      >
                        <span className="fw-bold">{sn}</span>
                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                          ({tier} - ₹{price})
                        </span>
                        <i
                          className="bi bi-x text-white cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSeatClick(sn)}
                        ></i>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            {selectedSeats.length > 0 && (
              <div className="pt-2 border-top border-secondary border-opacity-25">
                <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-3">
                  <li className="d-flex justify-content-between">
                    <span>
                      Tickets ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
                    </span>
                    <span className="text-white fw-medium">₹{subtotal}</span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span>Convenience Fee</span>
                    <span className="text-white fw-medium">₹{convenienceFee}</span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span>GST / Taxes (5%)</span>
                    <span className="text-white fw-medium">₹{taxes}</span>
                  </li>
                  <li className="d-flex justify-content-between pt-2 border-top border-secondary border-opacity-25 fs-6">
                    <span className="text-white fw-bold">Total Amount</span>
                    <span className="text-danger fw-extrabold fs-5">₹{totalAmount}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Proceed Action Button */}
            <button
              type="button"
              onClick={handleProceedToBook}
              disabled={selectedSeats.length === 0}
              className="btn btn-cinema w-100 py-3 mt-2"
            >
              {user ? (
                <>
                  <i className="bi bi-shield-check"></i> Proceed to Pay ₹{totalAmount || 0}
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i> Login & Book Tickets
                </>
              )}
            </button>

            <p className="text-center text-muted small mt-3 mb-0" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-lock-fill me-1"></i> Atomic reservation prevents double bookings.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION & PAYMENT MODAL */}
      {showModal && (
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
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-credit-card-2-front text-danger me-2"></i> Confirm Booking
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  disabled={bookingLoading}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3 p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <h6 className="text-white fw-bold mb-1">{movie.title}</h6>
                  <p className="text-secondary small mb-2">
                    {cinema.name} • Screen {showtime.screenNumber} • {showtime.startTime}
                  </p>
                  <div className="d-flex justify-content-between small text-white border-top border-secondary border-opacity-25 pt-2">
                    <span>Seats: {selectedSeats.join(', ')}</span>
                    <span className="text-danger fw-bold">Total: ₹{totalAmount}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Simulated Payment Method
                  </label>
                  <select
                    className="form-select cinema-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Card">Credit / Debit Card (Instant Test Pay)</option>
                    <option value="UPI">UPI / Google Pay (Instant Test Pay)</option>
                    <option value="NetBanking">Net Banking (Instant Test Pay)</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-secondary small">
                  <i className="bi bi-info-circle text-warning me-1"></i> This is a capstone demonstration mode. Payments are simulated instantly upon clicking Complete Booking.
                </div>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="btn btn-cinema btn-sm px-4"
                >
                  {bookingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Reserving Seats...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i> Complete Booking
                    </>
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

export default SeatSelectionPage;
