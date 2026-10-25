import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  // Format duration into hours and minutes
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const isUpcoming = movie.status === 'Upcoming' || movie.isUpcoming;

  return (
    <div className="cinema-card h-100 d-flex flex-column">
      <Link to={`/movies/${movie._id}`} className="movie-poster-wrapper text-decoration-none">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="poster-overlay"></div>

        {/* Top Badges */}
        <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
          {movie.rating && (
            <div className="badge-rating shadow-sm">
              <i className="bi bi-star-fill text-warning"></i>
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-dark bg-opacity-75 border border-secondary border-opacity-50 text-white px-2 py-1 small">
            {movie.certificate || 'UA'}
          </span>
        </div>

        {/* Bottom Poster Info Overlay */}
        <div className="position-absolute bottom-0 start-0 end-0 p-3 text-white">
          <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
            <span>{movie.language}</span>
            <span>{formatDuration(movie.duration)}</span>
          </div>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <Link to={`/movies/${movie._id}`} className="text-decoration-none">
            <h5 className="text-white fw-bold mb-2 text-truncate" title={movie.title}>
              {movie.title}
            </h5>
          </Link>

          {/* Genres */}
          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genre &&
              movie.genre.slice(0, 3).map((g, idx) => (
                <span key={idx} className="badge-genre">
                  {g}
                </span>
              ))}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isUpcoming ? (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-cinema-outline w-100 py-2 small"
            >
              <i className="bi bi-bell"></i> View Details
            </Link>
          ) : (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-cinema w-100 py-2 small"
            >
              <i className="bi bi-ticket-perforated-fill"></i> Book Tickets
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
