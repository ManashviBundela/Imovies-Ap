import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [groupedCinemas, setGroupedCinemas] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate today and next 3 dates in YYYY-MM-DD
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      dates.push({ dateStr, label: weekday, subLabel: dayNum });
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0].dateStr);
  }, []);

  // Fetch Movie Details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/movies/${id}`);
        if (res.data.success) {
          setMovie(res.data.movie);
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Movie not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Fetch showtimes for movie when selectedDate changes
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchShowtimes = async () => {
      setShowtimesLoading(true);
      try {
        const res = await api.get(`/api/showtimes/movie/${id}?date=${selectedDate}`);
        if (res.data.success) {
          setGroupedCinemas(res.data.groupedCinemas);
        }
      } catch (err) {
        console.error('Error fetching showtimes:', err);
      } finally {
        setShowtimesLoading(false);
      }
    };

    fetchShowtimes();
  }, [id, selectedDate]);

  if (loading) {
    return <LoadingSpinner message="Loading movie presentation..." />;
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger cinema-card p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h4>Movie Not Found</h4>
          <p className="text-secondary small">{error || 'This movie does not exist.'}</p>
          <Link to="/movies" className="btn btn-cinema btn-sm">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const isUpcoming = movie.status === 'Upcoming' || movie.isUpcoming;

  return (
    <div className="pb-5">
      {/* 1. CINEMATIC HERO BACKDROP BANNER */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '440px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div
          className="position-absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.85) 0%, rgba(9, 13, 22, 0.98) 100%)',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        ></div>

        <div className="container position-relative z-1 py-4">
          <div className="row g-4 align-items-center">
            {/* Poster Card */}
            <div className="col-lg-3 col-md-4 col-sm-6 text-center text-md-start">
              <div
                className="cinema-card mx-auto shadow-2xl"
                style={{ maxWidth: '280px', borderRadius: '14px', overflow: 'hidden' }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 d-block"
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="col-lg-9 col-md-8 text-white">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="badge-rating">
                  <i className="bi bi-star-fill text-warning"></i> {movie.rating?.toFixed(1)} / 10
                </span>
                <span className="badge bg-dark border border-secondary text-secondary">
                  {movie.votesCount?.toLocaleString()} Votes
                </span>
                <span className="badge bg-dark border border-secondary text-white">
                  {movie.certificate || 'UA'}
                </span>
                <span className="badge bg-danger">
                  {movie.status}
                </span>
              </div>

              <h1 className="display-4 fw-extrabold mb-3 text-white">
                {movie.title}
              </h1>

              {/* Meta pills */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary mb-3 small">
                <span>
                  <i className="bi bi-translate text-danger me-1"></i> {movie.language}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-clock text-danger me-1"></i> {formatDuration(movie.duration)}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-calendar3 text-danger me-1"></i>{' '}
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {movie.director && (
                  <>
                    <span>•</span>
                    <span>
                      <i className="bi bi-camera-reels text-danger me-1"></i> Dir: {movie.director}
                    </span>
                  </>
                )}
              </div>

              {/* Genres */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {movie.genre?.map((g, idx) => (
                  <span
                    key={idx}
                    className="badge bg-secondary bg-opacity-25 border border-secondary border-opacity-50 text-light px-3 py-1"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-light text-opacity-85 mb-4 max-w-700" style={{ lineHeight: '1.7' }}>
                {movie.description}
              </p>

              {/* Quick Actions */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-cinema-outline"
                  >
                    <i className="bi bi-play-circle-fill fs-5"></i> Watch Trailer
                  </a>
                )}
                {!isUpcoming && (
                  <a href="#showtimes-section" className="btn btn-cinema">
                    <i className="bi bi-ticket-perforated-fill"></i> Select Showtime Below
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          {/* Main Column: Showtimes & Cast */}
          <div className="col-lg-8">
            {/* 2. CAST SECTION */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-5">
                <h3 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-people-fill text-danger"></i> Top Cast & Crew
                </h3>
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
                  {movie.cast.map((actor, idx) => (
                    <div className="col" key={idx}>
                      <div className="cinema-card p-2 text-center h-100">
                        <img
                          src={actor.photoUrl}
                          alt={actor.name}
                          className="rounded-circle mx-auto mb-2 mt-1"
                          style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <h6 className="text-white fw-semibold mb-0 small text-truncate">
                          {actor.name}
                        </h6>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {actor.role || 'Cast'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SHOWTIMES & CINEMA SELECTION */}
            <div id="showtimes-section" className="pt-2">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                <h3 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-danger"></i> Showtimes & Tickets
                </h3>

                {/* Date Picker Selector */}
                <div className="d-flex gap-2 overflow-auto pb-1 max-w-100">
                  {availableDates.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`btn d-flex flex-column align-items-center justify-content-center px-3 py-2 rounded-3 text-nowrap ${
                        selectedDate === item.dateStr ? 'btn-danger' : 'btn-dark border border-secondary border-opacity-50 text-secondary'
                      }`}
                      style={{ minWidth: '78px', transition: 'all 0.2s ease' }}
                    >
                      <span className="small fw-bold">{item.label}</span>
                      <span style={{ fontSize: '0.75rem' }}>{item.subLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isUpcoming ? (
                <div className="cinema-card p-5 text-center">
                  <i className="bi bi-calendar-check fs-1 text-warning mb-3 d-block"></i>
                  <h4 className="text-white fw-semibold mb-2">Advance Booking Opening Soon</h4>
                  <p className="text-secondary small mb-0">
                    This movie is currently in the Upcoming schedule. Ticket bookings will open
                    prior to the release date ({new Date(movie.releaseDate).toLocaleDateString()}).
                  </p>
                </div>
              ) : showtimesLoading ? (
                <LoadingSpinner message="Fetching cinema schedules..." />
              ) : groupedCinemas.length === 0 ? (
                <div className="cinema-card p-5 text-center text-secondary">
                  <i className="bi bi-calendar-x fs-1 mb-2 d-block"></i>
                  <h5 className="text-white fw-medium mb-1">No Shows Available for this Date</h5>
                  <p className="small mb-0">
                    Please choose another date above to view available cinema showtimes.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {groupedCinemas.map(({ cinema, showtimes }) => (
                    <div
                      key={cinema._id}
                      className="p-4 rounded-4"
                      style={{
                        backgroundColor: '#162032',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {/* Cinema Header */}
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center pb-3 mb-3 border-bottom border-secondary border-opacity-25 gap-2">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-geo-alt-fill text-danger"></i>
                            <h5 className="text-white fw-bold mb-0">{cinema.name}</h5>
                          </div>
                          <p className="text-secondary small mb-0 ms-4">
                            {cinema.location}, {cinema.city} • {cinema.address}
                          </p>
                        </div>

                        {/* Facilities badges */}
                        <div className="d-flex flex-wrap gap-1">
                          {cinema.facilities?.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="badge bg-dark border border-secondary border-opacity-50 text-secondary"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Showtimes Slots */}
                      <div className="d-flex flex-wrap gap-3">
                        {showtimes.map((st) => (
                          <button
                            key={st._id}
                            onClick={() => navigate(`/seats/${st._id}`)}
                            className="btn btn-outline-light text-start p-3 rounded-3 cinema-time-slot"
                            style={{
                              backgroundColor: '#0b1120',
                              borderColor: 'rgba(255, 255, 255, 0.15)',
                              minWidth: '135px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e11d48')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                          >
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                              <span className="text-white fw-bold fs-6">
                                {st.startTime}
                              </span>
                              <span className="badge-format">{st.format}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: '0.75rem' }}>
                              <span>Screen {st.screenNumber}</span>
                              <span className="text-success fw-medium">
                                {st.availableSeatsCount} left
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column: Movie Meta & Booking Tips */}
          <div className="col-lg-4">
            <div
              className="p-4 rounded-4 mb-4"
              style={{
                backgroundColor: '#162032',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-danger"></i> Movie Details
              </h5>
              <ul className="list-unstyled d-flex flex-column gap-3 small text-secondary mb-0">
                <li className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                  <span>Language</span>
                  <span className="text-white fw-medium">{movie.language}</span>
                </li>
                <li className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                  <span>Duration</span>
                  <span className="text-white fw-medium">{formatDuration(movie.duration)}</span>
                </li>
                <li className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                  <span>Certificate</span>
                  <span className="text-white fw-medium">{movie.certificate}</span>
                </li>
                <li className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                  <span>Director</span>
                  <span className="text-white fw-medium">{movie.director}</span>
                </li>
                <li className="d-flex justify-content-between">
                  <span>Release Date</span>
                  <span className="text-white fw-medium">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                </li>
              </ul>
            </div>

            {/* Cinema Booking Guarantee */}
            <div
              className="p-4 rounded-4"
              style={{
                background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(225, 29, 72, 0.2)'
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shield-lock-fill text-danger fs-5"></i>
                <h6 className="text-white fw-bold mb-0">Atomic Guarantee</h6>
              </div>
              <p className="text-secondary small mb-3">
                Our backend database utilizes strict atomic condition reservations. Once you choose
                your seats and proceed, no other user can double book your seats.
              </p>
              <div className="d-flex align-items-center gap-2 text-white small">
                <i className="bi bi-check-circle-fill text-success"></i> Instant Digital QR Pass
              </div>
              <div className="d-flex align-items-center gap-2 text-white small mt-1">
                <i className="bi bi-check-circle-fill text-success"></i> Easy 30-min Cancellation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
