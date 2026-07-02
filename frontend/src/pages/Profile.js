import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <h3 className="text-section mb-4">My Profile</h3>
      <div className="card border-0 shadow-sm" style={{ maxWidth: 520 }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="avatar-circle-lg">{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <p className="fw-bold fs-5 mb-0">{user?.name}</p>
              <p className="text-muted mb-0">{user?.email}</p>
            </div>
          </div>
          <ul className="list-unstyled text-muted small mb-0">
            <li className="mb-2"><i className="bi bi-shield-check me-2 text-success"></i>Account verified</li>
            <li><i className="bi bi-mortarboard me-2 text-primary"></i>Role: {user?.role}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;