import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

axios.defaults.baseURL = 'http://localhost:5000';

const QuizForm = () => {
  const [form, setForm] = useState({ name: '', dob: '', color: '', number: '' });
  const [result, setResult] = useState(localStorage.getItem('personality') || '');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate deterministic userId
      const { data: { userId } } = await axios.post('/generate-id', form);

      // Try to get existing result
      const { data } = await axios.get(`/result?userId=${userId}`);

      localStorage.setItem('personality', data.personality);
      setResult(data.personality);

      // Show SweetAlert for existing result
      Swal.fire({
        icon: 'info',
        title: 'Welcome back!',
        text: `Your personality is "${data.personality}" (retrieved from our database).`,
        confirmButtonColor: '#3085d6',
      });

    } catch (err) {
      if (err.response?.status === 404) {
        // New user — store and generate result
        const { data } = await axios.post('/result', { ...form, id: await getUserId(form) });
        localStorage.setItem('personality', data.personality);
        setResult(data.personality);

        // Show SweetAlert for new result
        Swal.fire({
          icon: 'success',
          title: 'New Personality Assigned!',
          text: `Your personality is "${data.personality}".`,
          confirmButtonColor: '#28a745',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong. Please try again later!',
        });
      }
    }

    setLoading(false);
  };

  const getUserId = async (form) => {
    const { data } = await axios.post('/generate-id', form);
    return data.userId;
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow rounded-4">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">
                <span role="img" aria-label="lock">🔒</span> Personality Lock Quiz
              </h2>

              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold">👤 Name</label>
                  <input name="name" type="text" className="form-control form-control-lg" placeholder="Enter your full name" onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">🎂 Date of Birth</label>
                  <input name="dob" type="date" className="form-control form-control-lg" onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">🎨 Favorite Color</label>
                  <input name="color" type="text" className="form-control form-control-lg" placeholder="e.g., Blue, Green, Red" onChange={handleChange} required />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">🍀 Lucky Number</label>
                  <input name="number" type="number" className="form-control form-control-lg" placeholder="Enter your lucky number" onChange={handleChange} required />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? '🔄 Processing...' : '🔍 Get My Personality'}
                  </button>
                </div>
              </form>

              {result && (
                <div className="alert alert-success text-center mt-4 fs-5 shadow-sm rounded-3">
                  🎉 <strong>Your Personality:</strong> {result}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
