import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const result = await login(formData.email, formData.password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back!');
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
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
                  <h3 className="fw-bold mt-2">Welcome Back</h3>
                  <p className="text-muted">Login to continue learning</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light password-toggle-btn"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-2" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-muted">
                  Don't have an account? <Link to="/register" className="fw-semibold">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;