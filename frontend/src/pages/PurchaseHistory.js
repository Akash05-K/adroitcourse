import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import FeedbackModal from '../components/FeedbackModal';

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedCourseIds, setSubmittedCourseIds] = useState(new Set());
  const [hasActiveForm, setHasActiveForm] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null); // { courseId, courseTitle } | null
  const navigate = useNavigate();

  const fetchFeedbackStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/feedback/my-status');
      setSubmittedCourseIds(new Set(data.submitted.map((c) => c.courseId)));
      setHasActiveForm(data.hasActiveForm);
    } catch (err) {
      // Non-fatal — feedback prompts simply won't show if this fails
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    fetchFeedbackStatus();
  }, [fetchFeedbackStatus]);

  const handleFeedbackSubmitted = (courseId) => {
    setSubmittedCourseIds((prev) => new Set(prev).add(courseId));
    setFeedbackTarget(null);
  };

  if (loading) return <Spinner fullPage text="Loading your purchases..." />;

  return (
    <div className="container py-5">
      <button className="btn btn-back mb-3" onClick={() => navigate('/')}>
        <i className="bi bi-arrow-left"></i> Back to Courses
      </button>
      <h3 className="fw-bold mb-4"><i className="bi bi-bag-check-fill me-2"></i>My Purchases</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && orders.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-journal-x fs-1"></i>
          <p className="mt-3">You haven't purchased any courses yet.</p>
          <Link to="/" className="btn btn-primary mt-2">Browse Courses</Link>
        </div>
      )}

      <div className="row g-3">
        {orders.map((order) => {
          const courseId = order.courseId?._id;
          const isSuccess = order.paymentStatus === 'success';
          const alreadyReviewed = courseId && submittedCourseIds.has(courseId);

          return (
            <div className="col-12" key={order._id}>
              <div className="card border-0 shadow-sm">
                <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
                  <img
                    src={order.imageSnapshot || order.courseId?.image || 'https://via.placeholder.com/220x160?text=Course'}
                    alt={order.courseTitleSnapshot}
                    className="rounded-3"
                    style={{ width: 110, height: 80, objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/220x160?text=Course'; }}
                  />
                  <div className="flex-grow-1">
                    <p className="fw-semibold mb-1">{order.courseTitleSnapshot}</p>
                    <p className="text-muted small mb-1">
                      Purchased on {new Date(order.purchaseDate).toLocaleDateString()} via {order.paymentMethod}
                    </p>
                    <span
                      className={`badge ${
                        isSuccess ? 'bg-success' : order.paymentStatus === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                      }`}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-md-end d-flex flex-column align-items-md-end gap-2">
                    <p className="fw-bold fs-5 text-primary mb-0">₹{order.priceSnapshot}</p>
                    <div className="d-flex gap-2">
                      <Link to={`/order-success/${order._id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </Link>
                      {isSuccess && courseId && hasActiveForm && (
                        alreadyReviewed ? (
                          <span className="badge bg-success-subtle text-success align-self-center">
                            <i className="bi bi-check-circle-fill me-1"></i>Feedback Submitted
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-enroll"
                            onClick={() => setFeedbackTarget({ courseId, courseTitle: order.courseTitleSnapshot })}
                          >
                            <i className="bi bi-star me-1"></i>Give Feedback
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {feedbackTarget && (
        <FeedbackModal
          course={feedbackTarget}
          onClose={() => setFeedbackTarget(null)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default PurchaseHistory;