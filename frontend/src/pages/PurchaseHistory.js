import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  if (loading) return <Spinner fullPage text="Loading your purchases..." />;

  return (
    <div className="container py-5">
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
        {orders.map((order) => (
          <div className="col-12" key={order._id}>
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex flex-column flex-md-row align-items-md-center gap-3">
                <img
                  src={order.courseId?.image}
                  alt={order.courseTitleSnapshot}
                  className="rounded-3"
                  style={{ width: 110, height: 80, objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <p className="fw-semibold mb-1">{order.courseTitleSnapshot}</p>
                  <p className="text-muted small mb-1">
                    Purchased on {new Date(order.purchaseDate).toLocaleDateString()} via {order.paymentMethod}
                  </p>
                  <span
                    className={`badge ${
                      order.paymentStatus === 'success' ? 'bg-success' : order.paymentStatus === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-md-end">
                  <p className="fw-bold fs-5 text-primary mb-1">${order.priceSnapshot}</p>
                  <Link to={`/order-success/${order._id}`} className="btn btn-sm btn-outline-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistory;