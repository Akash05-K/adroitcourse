import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from './Spinner';

// course: { courseId, courseTitle }
const FeedbackModal = ({ course, onClose, onSubmitted }) => {
  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await api.get('/feedback/form');
        if (!data.form) {
          setError('No feedback form is available right now. Please check back later.');
        } else {
          setQuestions(data.form.questions);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load feedback form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, []);

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !ratings[q]);
    if (unanswered.length > 0) {
      toast.error('Please rate every question before submitting');
      return;
    }

    const answers = questions.map((q) => ({ question: q, rating: ratings[q] }));

    setSubmitting(true);
    try {
      await api.post('/feedback', { courseId: course.courseId, answers, comment });
      toast.success('Thank you for your feedback!');
      onSubmitted(course.courseId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal-backdrop" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Feedback: {course.courseTitle}</h5>
          <button className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        {loading && <Spinner text="Loading questions..." />}
        {!loading && error && <div className="alert alert-warning">{error}</div>}

        {!loading && !error && (
          <>
            <div className="feedback-modal-body">
              {questions.map((q, i) => (
                <div key={i} className="mb-3">
                  <p className="small fw-semibold mb-2">{i + 1}. {q}</p>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className="feedback-star-btn"
                        onClick={() => setRatings({ ...ratings, [q]: star })}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <i className={`bi ${star <= (ratings[q] || 0) ? 'bi-star-fill' : 'bi-star'}`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mb-2">
                <label className="form-label small fw-semibold">Additional comments (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary fw-semibold" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;