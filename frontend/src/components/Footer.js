import React from 'react';

const Footer = () => (
  <footer className="app-footer">
    <div className="container">
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <p className="footer-brand mb-2"><i className="bi bi-mortarboard-fill me-2"></i>LearnHub</p>
          <p className="text-white-50 small mb-2">Learn new skills faster with expert-led courses built for real careers.</p>
          <div>
            <a href="#!" className="footer-social" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
            <a href="#!" className="footer-social" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
            <a href="#!" className="footer-social" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <h6>Company</h6>
          <a href="#!" className="footer-link">About Us</a>
          <a href="#!" className="footer-link">Careers</a>
          <a href="#!" className="footer-link">Blog</a>
        </div>

        <div className="col-6 col-lg-3">
          <h6>Courses</h6>
          <a href="#!" className="footer-link">Web Development</a>
          <a href="#!" className="footer-link">Data Science</a>
          <a href="#!" className="footer-link">Design</a>
        </div>

        <div className="col-6 col-lg-3">
          <h6>Support</h6>
          <a href="#!" className="footer-link">Help Center</a>
          <a href="#!" className="footer-link">Privacy Policy</a>
          <a href="#!" className="footer-link">Contact</a>
        </div>
      </div>

      <div className="footer-bottom text-center">
        &copy; {new Date().getFullYear()} LearnHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;