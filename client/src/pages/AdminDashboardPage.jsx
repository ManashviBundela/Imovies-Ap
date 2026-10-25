import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'cinemas' | 'showtimes' | 'bookings'
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    duration: 150,
    language: 'English',
    certificate: 'UA',
    rating: 8.5,
    status: 'Now Showing',
    director: ''
  });

  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    movie: '',
    cinema: '',
    screenNumber: 1,
    showDate: new Date().toISOString().split('T')[0],
    startTime: '06:30 PM',
    format: '2D',
    tierPricing: { silver: 180, gold: 280, vip: 420 }
  });

  // Fetch stats & data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, cinemasRes, showtimesRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/movies?limit=100'),
        api.get('/api/cinemas'),
        api.get('/api/showtimes'),
        api.get('/api/bookings')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (moviesRes.data.success) setMovies(moviesRes.data.movies);
      if (cinemasRes.data.success) setCinemas(cinemasRes.data.cinemas);
      if (showtimesRes.data.success) setShowtimes(showtimesRes.data.showtimes);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);

      if (moviesRes.data.movies.length > 0 && !showtimeForm.movie) {
        setShowtimeForm((prev) => ({
          ...prev,
          movie: moviesRes.data.movies[0]._id,
          cinema: cinemasRes.data.cinemas[0]?._id || ''
        }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Movie CRUD
  const handleOpenMovieCreate = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '',
      description: '',
      posterUrl: '',
      bannerUrl: '',
      trailerUrl: '',
      genre: 'Action, Sci-Fi',
      duration: 150,
      language: 'English',
      certificate: 'UA',
      rating: 8.5,
      status: 'Now Showing',
      director: ''
    });
    setShowMovieModal(true);
  };

  const handleOpenMovieEdit = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl || '',
      genre: movie.genre ? movie.genre.join(', ') : '',
      duration: movie.duration,
      language: movie.language,
      certificate: movie.certificate || 'UA',
      rating: movie.rating || 8.0,
      status: movie.status,
      director: movie.director || ''
    });
    setShowMovieModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()).filter(Boolean),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
        releaseDate: editingMovie ? editingMovie.releaseDate : new Date()
      };

      if (editingMovie) {
        await api.put(`/api/movies/${editingMovie._id}`, payload);
        alert('Movie updated successfully!');
      } else {
        await api.post('/api/movies', payload);
        alert('Movie created successfully!');
      }

      setShowMovieModal(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save movie.');
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/api/movies/${id}`);
      alert('Movie deleted.');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  // Showtime CRUD
  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/showtimes', showtimeForm);
      alert('Showtime created successfully!');
      setShowShowtimeModal(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create showtime.');
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Delete this showtime?')) return;
    try {
      await api.delete(`/api/showtimes/${id}`);
      alert('Showtime deleted.');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete showtime.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing Administrator Control Center..." />;
  }

  return (
    <div className="container py-4 pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger">ADMINISTRATOR</span>
            <span className="text-secondary small">System Control Center</span>
          </div>
          <h1 className="text-white fw-bold display-6 mb-0">IMovies Management Portal</h1>
        </div>

        {/* Tab Switcher */}
        <div
          className="btn-group p-1 rounded-pill overflow-auto"
          style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'overview' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'movies' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies ({movies.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'cinemas' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => setActiveTab('cinemas')}
          >
            Cinemas ({cinemas.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'showtimes' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => setActiveTab('showtimes')}
          >
            Showtimes
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'bookings' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* 4 Quick Stat Cards */}
          <div className="row g-4 mb-4">
            <div className="col-lg-3 col-sm-6">
              <div
                className="p-4 rounded-4 cinema-card d-flex align-items-center gap-3"
                style={{ backgroundColor: '#162032' }}
              >
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
                >
                  <i className="bi bi-currency-rupee fs-3"></i>
                </div>
                <div>
                  <div className="text-secondary small">Total Revenue</div>
                  <h3 className="text-white fw-bold mb-0">₹{stats.totalRevenue?.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div
                className="p-4 rounded-4 cinema-card d-flex align-items-center gap-3"
                style={{ backgroundColor: '#162032' }}
              >
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#e11d48' }}
                >
                  <i className="bi bi-ticket-perforated-fill fs-3"></i>
                </div>
                <div>
                  <div className="text-secondary small">Total Bookings</div>
                  <h3 className="text-white fw-bold mb-0">{stats.totalBookings}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div
                className="p-4 rounded-4 cinema-card d-flex align-items-center gap-3"
                style={{ backgroundColor: '#162032' }}
              >
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
                >
                  <i className="bi bi-film fs-3"></i>
                </div>
                <div>
                  <div className="text-secondary small">Movies Listed</div>
                  <h3 className="text-white fw-bold mb-0">{stats.totalMovies}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div
                className="p-4 rounded-4 cinema-card d-flex align-items-center gap-3"
                style={{ backgroundColor: '#162032' }}
              >
                <div
                  className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}
                >
                  <i className="bi bi-building fs-3"></i>
                </div>
                <div>
                  <div className="text-secondary small">Cinemas & Halls</div>
                  <h3 className="text-white fw-bold mb-0">{stats.totalCinemas}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div
            className="p-4 rounded-4 cinema-card mb-4"
            style={{ backgroundColor: '#162032' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold mb-0">Recent Customer Bookings</h5>
              <button
                className="btn btn-cinema-outline btn-sm"
                onClick={() => setActiveTab('bookings')}
              >
                View All
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr className="text-secondary small border-secondary border-opacity-25">
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Cinema</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings?.map((b) => (
                    <tr key={b._id} className="border-secondary border-opacity-25">
                      <td className="fw-bold text-danger">{b.bookingReference}</td>
                      <td>{b.user?.name || 'Customer'}</td>
                      <td>{b.movie?.title}</td>
                      <td className="text-secondary">{b.cinema?.name}</td>
                      <td>{b.seatNumbers?.join(', ')}</td>
                      <td className="fw-bold text-white">₹{b.totalAmount}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE MOVIES TAB */}
      {activeTab === 'movies' && (
        <div
          className="p-4 rounded-4 cinema-card"
          style={{ backgroundColor: '#162032' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">All Movie Titles</h5>
            <button
              onClick={handleOpenMovieCreate}
              className="btn btn-cinema btn-sm"
            >
              <i className="bi bi-plus-lg"></i> Add New Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-secondary border-opacity-25">
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded"
                        style={{ width: '42px', height: '60px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-white">{m.title}</td>
                    <td>{m.genre?.join(', ')}</td>
                    <td>{m.duration} mins</td>
                    <td>
                      <span className="badge-rating py-1 px-2">
                        <i className="bi bi-star-fill text-warning"></i> {m.rating}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === 'Now Showing' ? 'bg-success' : 'bg-warning text-dark'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleOpenMovieEdit(m)}
                        className="btn btn-outline-info btn-sm me-2"
                        title="Edit Movie"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m._id, m.title)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Movie"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MANAGE CINEMAS TAB */}
      {activeTab === 'cinemas' && (
        <div
          className="p-4 rounded-4 cinema-card"
          style={{ backgroundColor: '#162032' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Cinema Theatres & Halls</h5>
          </div>

          <div className="row g-4">
            {cinemas.map((c) => (
              <div className="col-md-4" key={c._id}>
                <div
                  className="p-4 rounded-3 h-100"
                  style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <h5 className="text-white fw-bold mb-1">{c.name}</h5>
                  <p className="text-danger small mb-2">
                    <i className="bi bi-geo-alt-fill me-1"></i> {c.location}, {c.city}
                  </p>
                  <p className="text-secondary small mb-3">{c.address}</p>

                  <div className="border-top border-secondary border-opacity-25 pt-3">
                    <span className="text-muted small d-block mb-1">Screens:</span>
                    {c.screens?.map((scr) => (
                      <div
                        key={scr.screenNumber}
                        className="d-flex justify-content-between small text-white py-1"
                      >
                        <span>
                          {scr.name} ({scr.screenType})
                        </span>
                        <span className="text-secondary">{scr.totalSeats} seats</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MANAGE SHOWTIMES TAB */}
      {activeTab === 'showtimes' && (
        <div
          className="p-4 rounded-4 cinema-card"
          style={{ backgroundColor: '#162032' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Scheduled Showtimes</h5>
            <button
              onClick={() => setShowShowtimeModal(true)}
              className="btn btn-cinema btn-sm"
            >
              <i className="bi bi-plus-lg"></i> Add New Showtime
            </button>
          </div>

          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Format</th>
                  <th>Booked</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.slice(0, 50).map((st) => (
                  <tr key={st._id} className="border-secondary border-opacity-25">
                    <td className="fw-bold text-white">{st.movie?.title}</td>
                    <td>{st.cinema?.name}</td>
                    <td>{st.showDate}</td>
                    <td className="text-danger fw-semibold">{st.startTime}</td>
                    <td>
                      <span className="badge-format">{st.format}</span>
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-secondary">
                        {st.bookedSeats?.length || 0} / {st.totalSeats}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteShowtime(st._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Showtime"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MANAGE BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div
          className="p-4 rounded-4 cinema-card"
          style={{ backgroundColor: '#162032' }}
        >
          <h5 className="text-white fw-bold mb-4">Customer Booking Transactions</h5>

          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Date & Time</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-secondary border-opacity-25">
                    <td className="fw-bold text-danger">{b.bookingReference}</td>
                    <td>
                      <div className="text-white fw-medium">{b.user?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td>{b.movie?.title}</td>
                    <td className="text-secondary">{b.cinema?.name}</td>
                    <td>
                      {b.showDate} <span className="text-danger">{b.showTime}</span>
                    </td>
                    <td>{b.seatNumbers?.join(', ')}</td>
                    <td className="fw-bold text-white">₹{b.totalAmount}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MOVIE MODAL */}
      {showMovieModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: '#162032', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">
                  {editingMovie ? 'Edit Movie Record' : 'Add New Movie Title'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowMovieModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveMovie}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-secondary">Title *</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small text-secondary">Status</label>
                      <select
                        className="form-select cinema-input"
                        value={movieForm.status}
                        onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      >
                        <option value="Now Showing">Now Showing</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ended">Ended</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary">Description / Plot *</label>
                      <textarea
                        rows="3"
                        className="form-control cinema-input"
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Poster URL *</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Banner URL *</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        value={movieForm.bannerUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small text-secondary">Genres (comma separated)</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={movieForm.genre}
                        onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary">Duration (mins)</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small text-secondary">Rating (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control cinema-input"
                        value={movieForm.rating}
                        onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowMovieModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema btn-sm px-4">
                    Save Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SHOWTIME MODAL */}
      {showShowtimeModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: '#162032', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Schedule New Showtime</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowShowtimeModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateShowtime}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Movie *</label>
                    <select
                      className="form-select cinema-input"
                      value={showtimeForm.movie}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, movie: e.target.value })}
                      required
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Cinema *</label>
                    <select
                      className="form-select cinema-input"
                      value={showtimeForm.cinema}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, cinema: e.target.value })}
                      required
                    >
                      {cinemas.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        className="form-control cinema-input"
                        value={showtimeForm.showDate}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, showDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Time Slot</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        placeholder="e.g. 07:30 PM"
                        value={showtimeForm.startTime}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Format</label>
                      <select
                        className="form-select cinema-input"
                        value={showtimeForm.format}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value })}
                      >
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="IMAX 2D">IMAX 2D</option>
                        <option value="4DX">4DX</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Screen #</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={showtimeForm.screenNumber}
                        onChange={(e) => setShowtimeForm({ ...showtimeForm, screenNumber: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowShowtimeModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema btn-sm px-4">
                    Add Showtime
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
