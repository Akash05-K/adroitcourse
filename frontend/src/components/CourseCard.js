import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const seatsLeftPct = Math.round((course.vacantSeats / course.totalSeats) * 100);

  let seatBadgeClass = 'bg-success';
  let seatText = `${course.vacantSeats} seats left`;
  if (course.vacantSeats === 0) {
    seatBadgeClass = 'bg-danger';
    seatText = 'Sold Out';
  } else if (seatsLeftPct <= 20) {
    seatBadgeClass = 'bg-warning text-dark';
    seatText = `Only ${course.vacantSeats} left!`;
  }

  return (
    <div className="col">
      <div className="card course-card h-100 border-0 shadow-sm">
        <div className="course-img-wrap">
          <img src={course.image} className="card-img-top" alt={course.title} loading="lazy" />
          <span className={`badge seat-badge ${seatBadgeClass}`}>{seatText}</span>
          <span className="badge category-badge bg-dark bg-opacity-75">{course.category}</span>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold mb-1">{course.title}</h5>
          <p className="text-muted small mb-2">
            <i className="bi bi-person-circle me-1"></i>
            {course.instructor?.name}
          </p>
          <p className="card-text text-secondary small flex-grow-1">
            {course.description.length > 90 ? course.description.slice(0, 90) + '…' : course.description}
          </p>

          <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
            <span><i className="bi bi-clock-history me-1"></i>{course.duration}</span>
            <span className="vr"></span>
            <span><i className="bi bi-alarm me-1"></i>{course.dailyTiming}</span>
          </div>

          <div className="d-flex align-items-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${
                  star <= Math.round(course.ratings?.average || 0) ? 'bi-star-fill text-warning' : 'bi-star text-warning'
                } small`}
              ></i>
            ))}
            <span className="ms-2 small text-muted">
              {course.ratings?.average?.toFixed(1) || '0.0'} ({course.ratings?.count || 0})
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-auto">
            <span className="fs-4 fw-bold text-primary">${course.price}</span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                Details
              </button>
              <button
                className="btn btn-primary btn-sm fw-semibold"
                disabled={course.vacantSeats === 0}
                onClick={() => navigate(`/checkout/${course._id}`)}
              >
                {course.vacantSeats === 0 ? 'Sold Out' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;