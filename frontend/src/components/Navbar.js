import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
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
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    {/* Admin gets Admin Dashboard as the first, primary nav link */}
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/admin" end>
                        <i className="bi bi-speedometer2 me-1"></i>Admin Dashboard
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/admin/students">
                        <i className="bi bi-people-fill me-1"></i>Students
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/admin/feedback">
                        <i className="bi bi-star-fill me-1"></i>Feedback
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/" end>
                        <i className="bi bi-grid-fill me-1"></i>Courses
                      </NavLink>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/" end>
                        <i className="bi bi-grid-fill me-1"></i>Courses
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/my-orders">
                        <i className="bi bi-play-btn-fill me-1"></i>My Learning
                      </NavLink>
                    </li>
                  </>
                )}

                <li className="nav-item dropdown ms-lg-2">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center profile-trigger"
                    href="#!"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <span className="avatar-circle me-2">{user?.name?.charAt(0).toUpperCase()}</span>
                    <span className="d-none d-lg-inline">{user?.name?.split(' ')[0]}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-app">
                    <li className="px-2 pb-2">
                      <p className="fw-semibold mb-0 text-truncate">{user?.name}</p>
                      <p className="text-muted small mb-0 text-truncate">{user?.email}</p>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    {!isAdmin && (
                      <li>
                        <Link className="dropdown-item" to="/my-orders">
                          <i className="bi bi-collection-play me-2"></i>My Courses
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item" to="/settings">
                        <i className="bi bi-gear me-2"></i>Settings
                      </Link>
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
                  <NavLink className={({ isActive }) => `nav-link app-link ${isActive ? 'active' : ''}`} to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-1">
                  <Link className="btn-signup" to="/register">
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