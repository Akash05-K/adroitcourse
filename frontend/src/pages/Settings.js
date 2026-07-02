import React from 'react';

const Settings = () => (
  <div className="container py-5">
    <h3 className="text-section mb-4">Settings</h3>
    <div className="card border-0 shadow-sm" style={{ maxWidth: 520 }}>
      <div className="card-body p-4">
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="emailNotif" defaultChecked />
          <label className="form-check-label" htmlFor="emailNotif">Email notifications</label>
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" id="marketingEmails" />
          <label className="form-check-label" htmlFor="marketingEmails">Marketing emails</label>
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="darkMode" />
          <label className="form-check-label" htmlFor="darkMode">Dark mode (coming soon)</label>
        </div>
      </div>
    </div>
  </div>
);

export default Settings;