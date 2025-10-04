import React, { useState } from 'react';
// import axios from 'axios';
import api from '../services/api';  // use your configured axios instance
import { useNavigate } from 'react-router-dom';
import './ReportIssue.css';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'waste',
    image: null
  });
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        e.target.value = ''; // clear the input
        return;
      }
      setFormData({ ...formData, image: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token'); // ✅ get JWT token

    if (!user || !token) {
      alert('Please log in first');
      navigate('/login');
      return;
    }

    if (!location.latitude || !location.longitude) {
      alert('Please get your location first');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('latitude', location.latitude);
    data.append('longitude', location.longitude);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      // const res = await axios.post('http://localhost:5000/api/issues', data, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${token}`, // ✅ attach token
      //   },
      // });
      const res = await api.post('/issues', data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

      console.log(res.data);
      alert('Issue reported successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="report-issue">
      <div className="container">
        <h1>Report a Cleanliness Issue</h1>
        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Brief title of the issue"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Detailed description of the issue"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="waste">Waste</option>
              <option value="drainage">Drainage</option>
              <option value="graffiti">Graffiti</option>
              <option value="street_cleaning">Street Cleaning</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Image (Optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <button type="button" onClick={getLocation} className="location-btn">
              Get Current Location
            </button>
            {location.latitude && (
              <p className="location-coords">
                Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
          
          <button type="submit" className="submit-btn">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
