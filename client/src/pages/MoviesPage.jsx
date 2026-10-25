import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  const [movies, setMovies] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlGenre = searchParams.get('genre') || 'All';
    const urlLanguage = searchParams.get('language') || 'All';
    const urlStatus = searchParams.get('status') || 'All';
    const urlSort = searchParams.get('sortBy') || 'rating';

    setSearch(urlSearch);
    setGenre(urlGenre);
    setLanguage(urlLanguage);
    setStatus(urlStatus);
    setSortBy(urlSort);
  }, [searchParams]);

  // Load filter dropdown metadata
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/api/movies/meta/filters');
        if (res.data.success) {
          setGenreOptions(res.data.genres || []);
          setLanguageOptions(res.data.languages || []);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch movies based on active filters
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (genre !== 'All') params.append('genre', genre);
        if (language !== 'All') params.append('language', language);
        if (status !== 'All') params.append('status', status);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.get(`/api/movies?${params.toString()}`);
        if (res.data.success) {
          setMovies(res.data.movies);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [search, genre, language, status, sortBy]);

  const updateFilters = (newParams) => {
    const current = {
      search,
      genre,
      language,
      status,
      sortBy,
      ...newParams
    };

    const clean = {};
    Object.keys(current).forEach((k) => {
      if (current[k] && current[k] !== 'All') {
        clean[k] = current[k];
      }
    });

    setSearchParams(clean);
  };

  const handleResetFilters = () => {
    setSearch('');
    setGenre('All');
    setLanguage('All');
    setStatus('All');
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="container py-4 pb-5">
      {/* Page Title & Status Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="text-white fw-bold display-6 mb-1">Explore Movies</h1>
          <p className="text-secondary small mb-0">
            Browse our complete catalog of trending blockbusters, IMAX releases, and upcoming cinema sensations.
          </p>
        </div>

        {/* Status Toggle Pills */}
        <div
          className="btn-group p-1 rounded-pill"
          style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${status === 'All' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => updateFilters({ status: 'All' })}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${status === 'Now Showing' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => updateFilters({ status: 'Now Showing' })}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${status === 'Upcoming' ? 'btn-danger' : 'text-secondary'}`}
            onClick={() => updateFilters({ status: 'Upcoming' })}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div
        className="p-3 p-md-4 rounded-4 mb-4"
        style={{ backgroundColor: '#162032', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <div className="row g-3">
          {/* Search Input */}
          <div className="col-lg-4 col-md-6">
            <label className="form-label text-secondary small fw-semibold">Search Title</label>
            <div className="input-group">
              <span
                className="input-group-text bg-transparent text-secondary border-end-0"
                style={{ borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: '#0b1120' }}
              >
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control cinema-input border-start-0 ps-0"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
              {search && (
                <button
                  className="btn btn-dark border border-secondary border-start-0"
                  type="button"
                  onClick={() => updateFilters({ search: '' })}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Genre Filter */}
          <div className="col-lg-2 col-md-3 col-6">
            <label className="form-label text-secondary small fw-semibold">Genre</label>
            <select
              className="form-select cinema-input"
              value={genre}
              onChange={(e) => updateFilters({ genre: e.target.value })}
            >
              <option value="All">All Genres</option>
              {genreOptions.map((g, idx) => (
                <option key={idx} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="col-lg-2 col-md-3 col-6">
            <label className="form-label text-secondary small fw-semibold">Language</label>
            <select
              className="form-select cinema-input"
              value={language}
              onChange={(e) => updateFilters({ language: e.target.value })}
            >
              <option value="All">All Languages</option>
              {languageOptions.map((lang, idx) => (
                <option key={idx} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="col-lg-3 col-md-4 col-8">
            <label className="form-label text-secondary small fw-semibold">Sort By</label>
            <select
              className="form-select cinema-input"
              value={sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="rating">Rating: Highest First</option>
              <option value="releaseDateDesc">Release Date: Newest First</option>
              <option value="releaseDateAsc">Release Date: Oldest First</option>
              <option value="title">Alphabetical (A - Z)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="col-lg-1 col-md-2 col-4 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 py-2 small"
              title="Reset All Filters"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Movies Count and Results */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-secondary small">
          Showing <span className="text-white fw-bold">{movies.length}</span> movies
        </span>
        {(search || genre !== 'All' || language !== 'All' || status !== 'All') && (
          <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary border-opacity-50 small">
            Filtered results
          </span>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading catalog..." />
      ) : movies.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-secondary"
            style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <i className="bi bi-film fs-1"></i>
          </div>
          <h4 className="text-white fw-semibold mb-2">No Movies Found</h4>
          <p className="text-secondary small mb-4">
            We couldn't find any movie matching your current filters or search term.
          </p>
          <button onClick={handleResetFilters} className="btn btn-cinema btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie) => (
            <div className="col" key={movie._id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
