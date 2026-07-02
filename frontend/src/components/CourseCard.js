import React from 'react';
import { useNavigate } from 'react-router-dom';

const levelIcon = {
  Beginner: 'bi-signal-2',
  Intermediate: 'bi-signal-3',
  Advanced: 'bi-signal-4',
  legacy: 'bi-signal-2',
};

const formatStudents = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${n}`;
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const seatsLeftPct = Math.round((course.vacantSeats / course.totalSeats) * 100);
  const isFull = course.vacantSeats === 0;

  let seatBadgeClass = 'bg-success';
  let seatText = `${course.vacantSeats} seats left`;
  if (isFull) {
    seatBadgeClass = 'bg-danger';
    seatText = 'Full';
  } else if (seatsLeftPct <= 20) {
    seatBadgeClass = 'bg-warning text-dark';
    seatText = `${course.vacantSeats} left`;
  }

  const level = course.level || 'Beginner';

  return (
    <div className="col">
      <div className="card course-card shadow-sm">
        <div className="course-img-wrap">
          <img src={course.image} alt={course.title} loading="lazy" />
          <span className="badge category-badge">{course.category}</span>
          <span className={`badge seat-badge ${seatBadgeClass}`}>{seatText}</span>
          <span className="level-pill">
            <i className={`bi ${levelIcon[level] || 'bi-signal-2'}`}></i>
            {level}
          </span>
        </div>

        <div className="card-body">
          <h3 className="text-course" title={course.title}>{course.title}</h3>
          <p className="course-instructor">
            <i className="bi bi-person-circle me-1"></i>{course.instructor?.name}
          </p>

          <div className="rating-row">
            <span className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi ${star <= Math.round(course.ratings?.average || 0) ? 'bi-star-fill' : 'bi-star'}`}
                ></i>
              ))}
            </span>
            <span>{course.ratings?.average?.toFixed(1) || '0.0'}</span>
            <span className="review-count">({course.ratings?.count || 0} reviews)</span>
          </div>

          <div className="course-meta-row">
            <span>{course.duration}</span>
            <span className="dot">•</span>
            <span>{course.dailyTiming}</span>
            <span className="dot">•</span>
            <span>{formatStudents(course.studentsCount)} students</span>
          </div>

          <p className="course-desc-clamp">{course.description}</p>

          {course.certificateIncluded !== false && (
            <span className="certificate-badge">
              <i className="bi bi-award-fill"></i>Certificate Included
            </span>
          )}

          <div className="course-card-footer">
            <span className="course-price">${course.price}</span>
            <div className="course-card-actions">
              <button
                className="btn btn-view-details"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                View Details
              </button>
              <button
                className="btn btn-enroll"
                disabled={isFull}
                onClick={() => navigate(`/checkout/${course._id}`)}
              >
                {isFull ? 'Join Waitlist' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;