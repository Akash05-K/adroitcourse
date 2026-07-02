import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/courses', {
        params: { search, category, page, limit: 8 },
      });
      setCourses(data.courses);
      setCategories(data.categories);
      setTotalPages(data.totalPages);
      setTotalCourses(data.totalCourses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search input -> search state
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div>
      {/* Hero */}
      <div className="hero-banner text-white">
        <div className="container py-5">
          <h1 className="fw-bold display-6 mb-2">Learn New Skills Every Day</h1>
          <p className="lead mb-4 opacity-75">
            Explore {totalCourses}+ expert-led courses and start your journey today.
          </p>
          <div className="row g-2 justify-content-center">
            <div className="col-md-8">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search courses, instructors, topics..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Category filters */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm rounded-pill px-3 ${category === 'All' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => { setCategory('All'); setPage(1); }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill px-3 ${category === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => { setCategory(cat); setPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <Spinner text="Fetching the best courses for you..." />}

        {!loading && error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-emoji-frown fs-1"></i>
            <p className="mt-3">No courses found matching your criteria.</p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-5">
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;