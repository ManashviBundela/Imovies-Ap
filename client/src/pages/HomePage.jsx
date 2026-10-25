import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [genres, setGenres] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, allMoviesRes, filtersRes] = await Promise.all([
          api.get('/api/movies/featured'),
          api.get('/api/movies'),
          api.get('/api/movies/meta/filters')
        ]);

        if (featuredRes.data.success && featuredRes.data.movies.length > 0) {
          setFeaturedMovies(featuredRes.data.movies);
        }

        if (allMoviesRes.data.success) {
          const movies = allMoviesRes.data.movies;
          setNowShowing(movies.filter((m) => m.status === 'Now Showing'));
          setUpcoming(movies.filter((m) => m.status === 'Upcoming'));
          // If featured was empty, fallback to first now showing
          if (!featuredRes.data.movies || featuredRes.data.movies.length === 0) {
            setFeaturedMovies(movies.slice(0, 3));
          }
        }

        if (filtersRes.data.success) {
          setGenres(filtersRes.data.genres || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError('Unable to load movies right now. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Auto-rotate hero movie banner every 6 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentHero = featuredMovies[activeHeroIndex] || null;

  if (loading) {
    return <LoadingSpinner message="Preparing cinema highlights..." />;
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger cinema-card p-4 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block"></i>
          <h5>Oops! Failed to connect to server</h5>
          <p className="small mb-3 text-secondary">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-cinema btn-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-5">
      {/* 1. HERO BANNER */}
      {currentHero && (
        <section className="container pt-3 pb-4">
          <div
            className="hero-backdrop position-relative p-4 p-md-5"
            style={{
              backgroundImage: `url(${currentHero.bannerUrl || currentHero.posterUrl})`,
              minHeight: '480px'
            }}
          >
            <div className="hero-overlay"></div>

            <div className="position-relative z-1 col-lg-7 col-md-10 text-white">
              {/* Badges */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-danger text-uppercase fw-semibold px-2 py-1">
                  Featured
                </span>
                <span className="badge-rating">
                  <i className="bi bi-star-fill text-warning"></i> {currentHero.rating.toFixed(1)} / 10
                </span>
                <span className="badge bg-dark bg-opacity-75 border border-secondary text-secondary">
                  {currentHero.certificate || 'UA'}
                </span>
              </div>

              {/* Title */}
              <h1 className="display-4 fw-extrabold mb-3 text-white">
                {currentHero.title}
              </h1>

              {/* Meta */}
              <div className="d-flex align-items-center gap-3 text-secondary mb-3 small">
                <span>
                  <i className="bi bi-translate text-danger me-1"></i> {currentHero.language}
                </span>
                <span>•</span>
                <span>
                  <i className="bi bi-clock text-danger me-1"></i> {Math.floor(currentHero.duration / 60)}h{' '}
                  {currentHero.duration % 60}m
                </span>
                <span>•</span>
                <span>{currentHero.genre.join(', ')}</span>
              </div>

              {/* Description */}
              <p className="text-light text-opacity-75 fs-6 mb-4 line-clamp-3" style={{ maxHeight: '4.8em', overflow: 'hidden' }}>
                {currentHero.description}
              </p>

              {/* Actions */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link
                  to={`/movies/${currentHero._id}`}
                  className="btn btn-cinema px-4 py-2"
                >
                  <i className="bi bi-ticket-perforated-fill fs-5"></i> Book Tickets Now
                </Link>

                {currentHero.trailerUrl && (
                  <a
                    href={currentHero.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-cinema-outline px-4 py-2"
                  >
                    <i className="bi bi-play-circle fs-5"></i> Watch Trailer
                  </a>
                )}
              </div>

              {/* Carousel Indicators */}
              {featuredMovies.length > 1 && (
                <div className="d-flex gap-2 mt-4">
                  {featuredMovies.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`btn p-0 rounded-pill ${
                        idx === activeHeroIndex ? 'bg-danger' : 'bg-secondary'
                      }`}
                      style={{
                        width: idx === activeHeroIndex ? '28px' : '10px',
                        height: '6px',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. SEARCH & QUICK GENRES BAR */}
      <section className="container mb-5">
        <div
          className="p-3 p-md-4 rounded-4"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5 col-md-6">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <span
                    className="input-group-text bg-transparent border-end-0 text-secondary"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#090d16' }}
                  >
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control cinema-input border-start-0 ps-0"
                    placeholder="Search movies by title (e.g. Dune, Oppenheimer)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-cinema px-3">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Genre Pills */}
            <div className="col-lg-7 col-md-6">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted small fw-medium me-1">Popular:</span>
                <Link
                  to="/movies"
                  className="badge bg-dark border border-secondary border-opacity-50 text-white text-decoration-none px-3 py-2 rounded-pill hover-primary"
                >
                  All Genres
                </Link>
                {genres.slice(0, 5).map((genre, idx) => (
                  <Link
                    key={idx}
                    to={`/movies?genre=${encodeURIComponent(genre)}`}
                    className="badge bg-dark border border-secondary border-opacity-25 text-secondary text-decoration-none px-3 py-2 rounded-pill"
                    style={{ transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => (e.target.className = 'badge bg-danger text-white text-decoration-none px-3 py-2 rounded-pill')}
                    onMouseLeave={(e) => (e.target.className = 'badge bg-dark border border-secondary border-opacity-25 text-secondary text-decoration-none px-3 py-2 rounded-pill')}
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NOW SHOWING SECTION */}
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="rounded-circle d-inline-block bg-danger"
                style={{ width: '8px', height: '8px' }}
              ></span>
              <span className="text-danger fw-semibold small text-uppercase tracking-wider">
                In Theatres Now
              </span>
            </div>
            <h2 className="text-white fw-bold mb-0">Now Showing</h2>
          </div>
          <Link
            to="/movies?status=Now Showing"
            className="text-danger text-decoration-none fw-semibold small d-flex align-items-center gap-1"
          >
            See All Movies <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        {nowShowing.length === 0 ? (
          <div className="cinema-card p-5 text-center text-secondary">
            <i className="bi bi-film fs-1 mb-2 d-block"></i>
            <p>No currently showing movies found in the database.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {nowShowing.map((movie) => (
              <div className="col" key={movie._id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. UPCOMING MOVIES SECTION */}
      {upcoming.length > 0 && (
        <section className="container mb-5">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span
                  className="rounded-circle d-inline-block bg-warning"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="text-warning fw-semibold small text-uppercase tracking-wider">
                  Releasing Soon
                </span>
              </div>
              <h2 className="text-white fw-bold mb-0">Upcoming Blockbusters</h2>
            </div>
            <Link
              to="/movies?status=Upcoming"
              className="text-warning text-decoration-none fw-semibold small d-flex align-items-center gap-1"
            >
              View Anticipated <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {upcoming.map((movie) => (
              <div className="col" key={movie._id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. WHY BOOK WITH IMOVIES */}
      <section className="container my-5 pt-3">
        <div
          className="p-4 p-md-5 rounded-4"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #162032 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 mb-2">
              Cinema Excellence
            </span>
            <h2 className="display-6 fw-bold text-white mb-2">
              The Ultimate Movie Experience
            </h2>
            <p className="text-secondary small">
              Enjoy cutting-edge cinema technology, instant ticket confirmation, and zero booking hassle.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '56px', height: '56px', background: 'rgba(225, 29, 72, 0.15)', color: '#f43f5e' }}
                >
                  <i className="bi bi-badge-hd fs-3"></i>
                </div>
                <h5 className="text-white fw-semibold mb-1">IMAX & 4DX</h5>
                <p className="text-secondary small mb-0">Ultra-sharp laser projection with moving seats & sensory effects.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '56px', height: '56px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
                >
                  <i className="bi bi-grid-3x3-gap-fill fs-3"></i>
                </div>
                <h5 className="text-white fw-semibold mb-1">Interactive Seats</h5>
                <p className="text-secondary small mb-0">Choose your favorite seat with live real-time visual seat layouts.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}
                >
                  <i className="bi bi-shield-check fs-3"></i>
                </div>
                <h5 className="text-white fw-semibold mb-1">Guaranteed Atomic</h5>
                <p className="text-secondary small mb-0">Never get double booked. True atomic database reservations.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '56px', height: '56px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}
                >
                  <i className="bi bi-qr-code fs-3"></i>
                </div>
                <h5 className="text-white fw-semibold mb-1">Digital E-Ticket</h5>
                <p className="text-secondary small mb-0">Printable ticket pass with QR reference on your mobile device.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
