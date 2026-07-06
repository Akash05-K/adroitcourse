import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
      } catch (err) {
        setError(err.response?.data?.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <Spinner fullPage text="Loading course details..." />;

  if (error || !course) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Course not found'}</div>
        <Link to="/" className="btn btn-primary mt-2">Back to Courses</Link>
      </div>
    );
  }

  const seatsPct = Math.round((course.vacantSeats / course.totalSeats) * 100);

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Courses</Link></li>
          <li className="breadcrumb-item active">{course.title}</li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-lg-7">
          <img src={course.image} alt={course.title} className="img-fluid rounded-4 shadow-sm w-100 mb-4" style={{ maxHeight: 420, objectFit: 'cover' }} />
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary-subtle text-primary">{course.category}</span>
            <span className="badge bg-secondary-subtle text-secondary">{course.level || 'Beginner'}</span>
            {course.certificateIncluded !== false && (
              <span className="certificate-badge mb-0"><i className="bi bi-award-fill"></i>Certificate Included</span>
            )}
          </div>
          <h2 className="text-section mb-3">{course.title}</h2>

          <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
            <div className="d-flex align-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className={`bi ${star <= Math.round(course.ratings?.average || 0) ? 'bi-star-fill text-warning' : 'bi-star text-warning'}`}></i>
              ))}
              <span className="ms-2 text-muted">{course.ratings?.average?.toFixed(1)} ({course.ratings?.count} ratings)</span>
            </div>
            <span className="text-muted"><i className="bi bi-people-fill me-1"></i>{course.studentsCount || 0} students</span>
          </div>

          <p className="text-secondary">{course.description}</p>

          <h5 className="fw-bold mt-4 mb-3">Instructor</h5>
          <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
            <span className="avatar-circle-lg">{course.instructor?.name?.charAt(0)}</span>
            <div>
              <p className="fw-semibold mb-0">{course.instructor?.name}</p>
              <p className="text-muted small mb-0">{course.instructor?.bio}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-lg border-0 sticky-top" style={{ top: '90px' }}>
            <div className="card-body p-4">
              <h2 className="fw-bold text-primary mb-3">₹{course.price}</h2>

              <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                <li><i className="bi bi-clock-history me-2 text-primary"></i>Duration: <strong>{course.duration}</strong></li>
                <li><i className="bi bi-alarm me-2 text-primary"></i>Daily Timing: <strong>{course.dailyTiming}</strong></li>
                <li><i className="bi bi-people-fill me-2 text-primary"></i>Total Seats: <strong>{course.totalSeats}</strong></li>
                <li><i className="bi bi-person-check-fill me-2 text-primary"></i>Vacant Seats: <strong>{course.vacantSeats}</strong></li>
              </ul>

              <div className="mb-3">
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className={`progress-bar ${seatsPct <= 20 ? 'bg-danger' : 'bg-success'}`}
                    style={{ width: `${seatsPct}%` }}
                  ></div>
                </div>
                <p className="small text-muted mt-1 mb-0">{course.vacantSeats} of {course.totalSeats} seats available</p>
              </div>

              {isAdmin ? (
                <div className="alert alert-secondary small mb-0 text-center">
                  <i className="bi bi-info-circle me-1"></i>
                  Admin view — manage this course from the{' '}
                  <Link to="/admin" className="fw-semibold">Admin Dashboard</Link>.
                </div>
              ) : (
                <button
                  className="btn btn-enroll w-100 fw-semibold py-2"
                  disabled={course.vacantSeats === 0}
                  onClick={() => navigate(`/checkout/${course._id}`)}
                >
                  {course.vacantSeats === 0 ? 'Join Waitlist' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;