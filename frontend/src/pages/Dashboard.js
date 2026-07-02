import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import Spinner from '../components/Spinner';

const categoryIcons = {
  All: 'bi-grid',
  'Web Development': 'bi-code-slash',
  'Data Science': 'bi-bar-chart-fill',
  Design: 'bi-palette-fill',
  'Cloud Computing': 'bi-cloud-fill',
  Marketing: 'bi-graph-up-arrow',
};

const instructors = [
  { name: 'Ananya Sharma', title: 'Full-Stack Engineer', students: '4.2k', courses: 2, initial: 'A' },
  { name: 'Rahul Verma', title: 'Ex-FAANG SDE', students: '8.9k', courses: 1, initial: 'R' },
  { name: 'Priya Nair', title: 'Data Scientist', students: '2.7k', courses: 2, initial: 'P' },
  { name: 'Kabir Malhotra', title: 'Senior Product Designer', students: '1.4k', courses: 1, initial: 'K' },
];

const testimonials = [
  {
    quote:
      'The MERN course took me from knowing basic HTML to shipping a full production app in three months. The instructor feedback made all the difference.',
    name: 'Meera Joshi',
    role: 'Frontend Developer at Zeta',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    quote:
      'Best DSA course I have taken online. Clear explanations, real interview patterns, and a community that keeps you accountable.',
    name: 'Arjun Das',
    role: 'SDE-2 at a fintech startup',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    quote:
      'I switched careers into data science after this course. The projects were exactly what recruiters asked about in interviews.',
    name: 'Sara Thomas',
    role: 'Data Analyst',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
];

const faqs = [
  {
    q: 'How do I get access to a course after purchasing?',
    a: 'As soon as your payment is confirmed, the course appears under "My Learning" in your account, along with class timings and instructor details.',
  },
  {
    q: 'Do I get a certificate after completing a course?',
    a: 'Yes. Courses marked with the "Certificate Included" badge award a shareable certificate once you complete the required sessions.',
  },
  {
    q: 'What happens if a course is full?',
    a: 'You can join the waitlist from the course card. We will notify you by email the moment a seat opens up.',
  },
  {
    q: 'Can I get a refund if I change my mind?',
    a: 'Refunds are available within 7 days of purchase as long as fewer than 2 classes have been attended. Reach out to support to start the process.',
  },
];

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
  const [openFaq, setOpenFaq] = useState(0);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div>
      {/* ---------- Compact hero ---------- */}
      <div className="hero-banner text-white text-center">
        <div className="container">
          <span className="hero-eyebrow"><i className="bi bi-stars"></i> Learn from industry experts</span>
          <h1 className="text-hero">Learn New Skills Faster</h1>
          <p className="hero-subtitle mx-auto">Explore expert-led courses and grow your career.</p>

          <div className="hero-search mx-auto">
            <span className="search-icon"><i className="bi bi-search"></i></span>
            <input
              type="text"
              placeholder="Search for Python, UI Design, AWS..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <select
              className="category-select d-none d-sm-block"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="filter-btn" type="button" aria-label="Filters">
              <i className="bi bi-sliders"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Social proof strip ---------- */}
      <div className="social-proof">
        <div className="container d-flex flex-wrap align-items-center justify-content-center gap-3">
          <div className="avatar-stack">
            <img className="stack-avatar" src="https://i.pravatar.cc/80?img=5" alt="" />
            <img className="stack-avatar" src="https://i.pravatar.cc/80?img=15" alt="" />
            <img className="stack-avatar" src="https://i.pravatar.cc/80?img=25" alt="" />
            <img className="stack-avatar" src="https://i.pravatar.cc/80?img=35" alt="" />
          </div>
          <span className="text-body fw-semibold text-ink-700">Trusted by 10,000+ learners</span>
          <span className="rating-pill"><i className="bi bi-star-fill"></i> 4.8 average rating from students</span>
        </div>
      </div>

      <div className="container section">
        {/* ---------- Category chips ---------- */}
        <div className="category-scroll mb-4">
          <button
            className={`category-chip ${category === 'All' ? 'active' : ''}`}
            onClick={() => { setCategory('All'); setPage(1); }}
          >
            <i className={`bi ${categoryIcons.All}`}></i> All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat); setPage(1); }}
            >
              <i className={`bi ${categoryIcons[cat] || 'bi-bookmark'}`}></i> {cat}
            </button>
          ))}
        </div>

        {/* ---------- Section heading ---------- */}
        <div className="mb-4">
          <p className="section-eyebrow">Featured Courses</p>
          <h2 className="text-section mb-1">{totalCourses} courses to explore</h2>
          <p className="section-subtitle">Hand-picked, expert-led courses across web development, data, design, cloud, and marketing.</p>
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

      {/* ---------- Top Instructors ---------- */}
      <div className="section section-soft">
        <div className="container">
          <div className="mb-4 text-center">
            <p className="section-eyebrow">Meet the experts</p>
            <h2 className="text-section">Top Instructors</h2>
            <p className="section-subtitle mx-auto">Learn directly from practitioners currently working at leading companies.</p>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {instructors.map((inst) => (
              <div className="col" key={inst.name}>
                <div className="instructor-card">
                  <span className="avatar-circle-lg">{inst.initial}</span>
                  <p className="fw-bold mb-0 mt-2">{inst.name}</p>
                  <p className="instructor-title mb-0">{inst.title}</p>
                  <div className="instructor-stats">
                    <span><i className="bi bi-people-fill me-1"></i>{inst.students}</span>
                    <span><i className="bi bi-collection-play-fill me-1"></i>{inst.courses} courses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Testimonials ---------- */}
      <div className="section">
        <div className="container">
          <div className="mb-4 text-center">
            <p className="section-eyebrow">Student stories</p>
            <h2 className="text-section">Student Testimonials</h2>
            <p className="section-subtitle mx-auto">Real outcomes from learners who upskilled with LearnHub.</p>
          </div>
          <div className="row row-cols-1 row-cols-md-3 g-3">
            {testimonials.map((t) => (
              <div className="col" key={t.name}>
                <div className="testimonial-card">
                  <span className="quote-mark">"</span>
                  <p className="quote">{t.quote}</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt={t.name} />
                    <div>
                      <p className="name mb-0">{t.name}</p>
                      <p className="role mb-0">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- FAQ ---------- */}
      <div className="section section-soft">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="mb-4 text-center">
            <p className="section-eyebrow">Good to know</p>
            <h2 className="text-section">Frequently Asked Questions</h2>
          </div>
          {faqs.map((item, idx) => (
            <div className="faq-item" key={item.q}>
              <button
                className="faq-question"
                aria-expanded={openFaq === idx}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                {item.q}
                <i className="bi bi-chevron-down"></i>
              </button>
              {openFaq === idx && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;