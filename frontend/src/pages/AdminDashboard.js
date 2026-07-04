import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const emptyForm = {
  _id: null,
  title: '',
  description: '',
  duration: '',
  dailyTiming: '',
  totalSeats: '',
  price: '',
  category: '',
  level: 'Beginner',
  image: '',
  instructorName: '',
  instructorBio: '',
  certificateIncluded: true,
};

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // High limit to effectively fetch all courses for admin management
      const { data } = await api.get('/courses', { params: { limit: 200 } });
      setCourses(data.courses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
  };

  const startEdit = (course) => {
    setFormData({
      _id: course._id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      dailyTiming: course.dailyTiming,
      totalSeats: course.totalSeats,
      price: course.price,
      category: course.category,
      level: course.level || 'Beginner',
      image: course.image,
      instructorName: course.instructor?.name || '',
      instructorBio: course.instructor?.bio || '',
      certificateIncluded: course.certificateIncluded !== false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startCreate = () => {
    setFormData(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.duration || !formData.dailyTiming || !formData.category) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!formData.totalSeats || Number(formData.totalSeats) < 1) {
      toast.error('Total seats must be at least 1.');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    if (!formData.instructorName) {
      toast.error('Instructor name is required.');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      dailyTiming: formData.dailyTiming,
      totalSeats: Number(formData.totalSeats),
      price: Number(formData.price),
      category: formData.category,
      level: formData.level,
      image: formData.image || undefined,
      instructor: { name: formData.instructorName, bio: formData.instructorBio },
      certificateIncluded: formData.certificateIncluded,
    };

    setSubmitting(true);
    try {
      if (formData._id) {
        await api.put(`/courses/${formData._id}`, payload);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', payload);
        toast.success('Course created successfully');
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${course._id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <p className="section-eyebrow mb-1">Admin</p>
          <h3 className="text-section mb-0">Manage Courses</h3>
        </div>
        {!showForm && (
          <button className="btn btn-primary fw-semibold" onClick={startCreate}>
            <i className="bi bi-plus-lg me-1"></i>Add New Course
          </button>
        )}
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">{formData._id ? 'Edit Course' : 'New Course'}</h5>
              <button className="btn-close" onClick={resetForm} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Category *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Web Development"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Description *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Duration *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2 months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Daily Timing *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 6:00 PM - 8:00 PM"
                    value={formData.dailyTiming}
                    onChange={(e) => setFormData({ ...formData, dailyTiming: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Total Seats *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  />
                  {formData._id && (
                    <div className="form-text">Vacant seats aren't editable here — they change automatically as students enroll.</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Level</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Instructor Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Instructor Bio</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.instructorBio}
                    onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="certificateIncluded"
                      checked={formData.certificateIncluded}
                      onChange={(e) => setFormData({ ...formData, certificateIncluded: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="certificateIncluded">
                      Certificate included
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary fw-semibold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Saving...
                    </>
                  ) : formData._id ? (
                    'Update Course'
                  ) : (
                    'Create Course'
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <Spinner text="Loading courses..." />}
      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={course.image} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                        <span className="fw-semibold">{course.title}</span>
                      </div>
                    </td>
                    <td>{course.category}</td>
                    <td>{course.level}</td>
                    <td>₹{course.price}</td>
                    <td>
                      {course.vacantSeats} / {course.totalSeats}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(course)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(course)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No courses yet — click "Add New Course" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;