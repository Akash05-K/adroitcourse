import React from 'react';

const Spinner = ({ fullPage = false, text = 'Loading...' }) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center ${
      fullPage ? 'spinner-fullpage' : 'py-5'
    }`}
  >
    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">{text}</span>
    </div>
    <p className="mt-3 text-muted">{text}</p>
  </div>
);

export default Spinner;