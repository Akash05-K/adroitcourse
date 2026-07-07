import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const BAR_COLORS = ['#4f46e5', '#7c3aed', '#0d9488', '#d97706', '#16a34a', '#db2777', '#0891b2', '#ea580c'];

const truncate = (str, n) => (str.length > n ? str.slice(0, n - 1) + '…' : str);

const AdminFeedback = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForm = useCallback(async () => {
    try {
      const { data } = await api.get('/feedback/form');
      setActiveForm(data.form);
    } catch (err) {
      // non-fatal — just means no form yet
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/feedback/analytics');
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForm();
    fetchAnalytics();
  }, [fetchForm, fetchAnalytics]);

  const handleDeleteForm = async () => {
    if (!activeForm) return;
    if (!window.confirm('Delete this feedback form? Students will no longer be able to submit new feedback until you upload a new one. Existing responses and analytics are kept.')) {
      return;
    }
    try {
      await api.delete(`/feedback/form/${activeForm._id}`);
      toast.success('Feedback form deleted');
      setActiveForm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete feedback form');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose an .xlsx or .xls file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await api.post('/feedback/upload-form', formData, {
        headers: { 'Content-Type': undefined },
      });
      toast.success(data.message);
      setFile(null);
      document.getElementById('feedbackFileInput').value = '';
      fetchForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <p className="section-eyebrow mb-1">Admin</p>
        <h3 className="text-section mb-0">Course Feedback</h3>
        <p className="text-muted mt-1 mb-0">
          Upload a feedback question set for students, then track responses here.
        </p>
      </div>

      {/* ---------- Upload form ---------- */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">Upload Feedback Questions</h6>
          <form onSubmit={handleUpload} className="d-flex flex-wrap gap-2 align-items-center">
            <input
              id="feedbackFileInput"
              type="file"
              accept=".xlsx,.xls"
              className="form-control"
              style={{ maxWidth: 340 }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <button type="submit" className="btn btn-primary fw-semibold" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-1"></i>Upload
                </>
              )}
            </button>
          </form>
          <p className="text-muted small mt-2 mb-0">
            Excel file with one question per row in column A. A "Question" header row is optional.
          </p>

          {activeForm && (
            <div className="mt-3 pt-3 border-top">
              <div className="feedback-file-card">
                <div className="feedback-file-icon">
                  <i className="bi bi-file-earmark-spreadsheet-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="fw-semibold mb-0">{activeForm.sourceFileName || 'Feedback form'}</p>
                  <p className="text-muted small mb-0">
                    {activeForm.questions.length} question{activeForm.questions.length !== 1 ? 's' : ''} • Uploaded{' '}
                    {new Date(activeForm.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDeleteForm}
                  title="Delete this feedback form"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Analytics ---------- */}
      {loading && <Spinner text="Loading feedback analytics..." />}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && analytics && analytics.totalResponses === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bar-chart fs-1"></i>
          <p className="mt-3">No feedback submitted yet. Charts will appear here once students respond.</p>
        </div>
      )}

      {!loading && !error && analytics && analytics.totalResponses > 0 && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm text-center p-4">
                <p className="text-muted small mb-1">Overall Average Rating</p>
                <h2 className="fw-bold text-primary mb-1">{analytics.overallAverage} / 5</h2>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi ${star <= Math.round(analytics.overallAverage) ? 'bi-star-fill' : 'bi-star'} text-warning`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm text-center p-4">
                <p className="text-muted small mb-1">Total Responses</p>
                <h2 className="fw-bold mb-1">{analytics.totalResponses}</h2>
                <p className="text-muted small mb-0">across {analytics.byCourse.length} course(s)</p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Average Rating by Course</h6>
              <ResponsiveContainer width="100%" height={Math.max(analytics.byCourse.length * 50, 200)}>
                <BarChart data={analytics.byCourse} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis
                    type="category"
                    dataKey="courseTitle"
                    width={200}
                    tickFormatter={(v) => truncate(v, 26)}
                    fontSize={12}
                  />
                  <Tooltip formatter={(value) => [`${value} / 5`, 'Average rating']} />
                  <Bar dataKey="averageRating" radius={[0, 6, 6, 0]}>
                    {analytics.byCourse.map((entry, index) => (
                      <Cell key={entry.courseId} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Average Rating by Question (all courses combined)</h6>
              <ResponsiveContainer width="100%" height={Math.max(analytics.byQuestion.length * 50, 200)}>
                <BarChart data={analytics.byQuestion} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis
                    type="category"
                    dataKey="question"
                    width={260}
                    tickFormatter={(v) => truncate(v, 34)}
                    fontSize={12}
                  />
                  <Tooltip formatter={(value) => [`${value} / 5`, 'Average rating']} />
                  <Bar dataKey="averageRating" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeedback;