import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const AdminStudents = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/admin/all');
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(orders.map((o) => o.courseId?.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesCategory = categoryFilter === 'All' || o.courseId?.category === categoryFilter;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        o.userId?.name?.toLowerCase().includes(searchLower) ||
        o.userId?.email?.toLowerCase().includes(searchLower) ||
        o.courseId?.title?.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [orders, categoryFilter, search]);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <p className="section-eyebrow mb-1">Admin</p>
        <h3 className="text-section mb-0">Student Details</h3>
        <p className="text-muted mt-1 mb-0">Every enrollment across all courses, filterable by category.</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
      </div>

      {loading && <Spinner text="Loading student data..." />}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-semibold">{order.userId?.name || '—'}</td>
                    <td className="text-muted small">{order.userId?.email || '—'}</td>
                    <td>{order.courseId?.title || order.courseTitleSnapshot}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {order.courseId?.category || '—'}
                      </span>
                    </td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.paymentStatus === 'success'
                            ? 'bg-success'
                            : order.paymentStatus === 'pending'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(order.purchaseDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No enrollments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && (
        <p className="text-muted small mt-3 mb-0">
          Showing {filtered.length} of {orders.length} total enrollment{orders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default AdminStudents;