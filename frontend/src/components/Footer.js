import React from 'react';

const Footer = () => (
  <footer className="app-footer text-light py-4 mt-5">
    <div className="container text-center small">
      <p className="mb-1 fw-semibold">
        <i className="bi bi-mortarboard-fill me-1"></i>LearnHub
      </p>
      <p className="mb-0 text-white-50">&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;