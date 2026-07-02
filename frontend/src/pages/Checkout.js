import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const paymentOptions = [
  { key: 'Credit Card', icon: 'bi-credit-card-fill', label: 'Credit Card' },
  { key: 'Debit Card', icon: 'bi-credit-card-2-front-fill', label: 'Debit Card' },
  { key: 'UPI', icon: 'bi-phone-fill', label: 'UPI' },
  { key: 'Net Banking', icon: 'bi-bank', label: 'Net Banking' },
  { key: 'Wallet', icon: 'bi-wallet2', label: 'Wallet' },
  { key: 'Cash on Delivery', icon: 'bi-cash-coin', label: 'Cash on Delivery' },
  { key: 'PayPal', icon: 'bi-paypal', label: 'PayPal' },
];

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('Credit Card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data.course);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const validateCard = () => {
    if (!['Credit Card', 'Debit Card'].includes(selectedMethod)) return {};
    const errs = {};
    if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) errs.number = 'Enter a valid 16-digit card number';
    if (!cardDetails.name.trim()) errs.name = 'Name on card is required';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) errs.expiry = 'Use MM/YY format';
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) errs.cvv = 'Enter a valid CVV';
    return errs;
  };

  const handlePlaceOrder = async () => {
    const errs = validateCard();
    setCardErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPlacingOrder(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        courseId: id,
        paymentMethod: selectedMethod,
      });
      toast.success('Payment successful! Course purchased.');
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Spinner fullPage text="Preparing checkout..." />;

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Course not found'}</div>
        <Link to="/" className="btn btn-primary mt-2">Back to Courses</Link>
      </div>
    );
  }

  const tax = +(course.price * 0.05).toFixed(2);
  const total = +(course.price + tax).toFixed(2);

  return (
    <div className="container py-5">
      <button className="btn btn-back mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <h3 className="fw-bold mb-4"><i className="bi bi-bag-check me-2"></i>Checkout</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {course.vacantSeats === 0 && (
        <div className="alert alert-warning">This course just sold out. Please choose another course.</div>
      )}

      <div className="row g-4">
        {/* Left: course + payment method */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Order Item</h6>
              <div className="d-flex gap-3">
                <img src={course.image} alt={course.title} className="rounded-3" style={{ width: 100, height: 80, objectFit: 'cover' }} />
                <div>
                  <p className="fw-semibold mb-1">{course.title}</p>
                  <p className="text-muted small mb-1">By {course.instructor?.name}</p>
                  <p className="text-muted small mb-0">{course.duration} • {course.dailyTiming}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Select Payment Method</h6>
              <div className="row g-2 mb-3">
                {paymentOptions.map((opt) => (
                  <div className="col-6 col-md-4" key={opt.key}>
                    <div
                      className={`payment-option d-flex align-items-center gap-2 p-3 rounded-3 border ${selectedMethod === opt.key ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'}`}
                      role="button"
                      onClick={() => setSelectedMethod(opt.key)}
                    >
                      <input type="radio" checked={selectedMethod === opt.key} onChange={() => setSelectedMethod(opt.key)} className="form-check-input mt-0" />
                      <i className={`bi ${opt.icon} fs-5`}></i>
                      <span className="small fw-semibold">{opt.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {['Credit Card', 'Debit Card'].includes(selectedMethod) && (
                <div className="border-top pt-3 mt-2">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        className={`form-control ${cardErrors.number ? 'is-invalid' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      />
                      {cardErrors.number && <div className="invalid-feedback">{cardErrors.number}</div>}
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Name on Card</label>
                      <input
                        type="text"
                        className={`form-control ${cardErrors.name ? 'is-invalid' : ''}`}
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                      {cardErrors.name && <div className="invalid-feedback">{cardErrors.name}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        className={`form-control ${cardErrors.expiry ? 'is-invalid' : ''}`}
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                      {cardErrors.expiry && <div className="invalid-feedback">{cardErrors.expiry}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        className={`form-control ${cardErrors.cvv ? 'is-invalid' : ''}`}
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                      {cardErrors.cvv && <div className="invalid-feedback">{cardErrors.cvv}</div>}
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'UPI' && (
                <div className="border-top pt-3 mt-2">
                  <label className="form-label small fw-semibold">UPI ID</label>
                  <input type="text" className="form-control" placeholder="yourname@upi" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: price summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '90px' }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3">Price Summary</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Course Price</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-primary w-100 py-2 fw-semibold"
                onClick={handlePlaceOrder}
                disabled={placingOrder || course.vacantSeats === 0}
              >
                {placingOrder ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Processing Payment...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>Pay ${total.toFixed(2)}
                  </>
                )}
              </button>
              <p className="text-muted small text-center mt-2 mb-0">
                <i className="bi bi-shield-check me-1"></i>100% Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;