import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>LearnHub
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    <i className="bi bi-grid-fill me-1"></i>Courses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-orders">
                    <i className="bi bi-bag-check-fill me-1"></i>My Purchases
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#!"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <span className="avatar-circle me-2">{user?.name?.charAt(0).toUpperCase()}</span>
                    {user?.name?.split(' ')[0]}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li>
                      <span className="dropdown-item-text text-muted small">{user?.email}</span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm fw-semibold px-3" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;