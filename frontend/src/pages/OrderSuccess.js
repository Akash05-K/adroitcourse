import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Spinner fullPage text="Confirming your order..." />;

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Order not found'}</div>
        <Link to="/" className="btn btn-primary mt-2">Back to Courses</Link>
      </div>
    );
  }

  const isSuccess = order.paymentStatus === 'success';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card border-0 shadow-lg text-center p-4">
            <div className="card-body">
              <i
                className={`bi ${isSuccess ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}
                style={{ fontSize: '4rem' }}
              ></i>
              <h3 className="fw-bold mt-3">{isSuccess ? 'Order Confirmed!' : 'Payment Failed'}</h3>
              <p className="text-muted">
                {isSuccess
                  ? "Thank you for your purchase. You're all set to start learning."
                  : 'Something went wrong while processing your payment.'}
              </p>

              <div className="text-start bg-light rounded-3 p-3 mt-4">
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Order ID</span>
                  <span className="fw-semibold">{order._id}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Course</span>
                  <span className="fw-semibold">{order.courseTitleSnapshot}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Amount Paid</span>
                  <span className="fw-semibold">${order.priceSnapshot}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Payment Method</span>
                  <span className="fw-semibold">{order.paymentMethod}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Transaction ID</span>
                  <span className="fw-semibold">{order.transactionId}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Date</span>
                  <span className="fw-semibold">{new Date(order.purchaseDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-center mt-4">
                <Link to="/" className="btn btn-outline-primary">Browse More Courses</Link>
                <Link to="/my-orders" className="btn btn-primary">View My Purchases</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;