import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const result = await register(formData.name, formData.email, formData.password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 auth-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                  <h3 className="fw-bold mt-2">Create Account</h3>
                  <p className="text-muted">Start your learning journey today</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email address</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-2" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-muted">
                  Already have an account? <Link to="/login" className="fw-semibold">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;