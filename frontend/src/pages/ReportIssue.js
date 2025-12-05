import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './ReportIssue.css';
import ImageUpload from "../components/ImageUpload";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      setPosition({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position.latitude ? (
    <Marker 
      position={[position.latitude, position.longitude]} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition({ latitude: pos.lat, longitude: pos.lng });
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    />
  ) : null;
}


const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'waste',
    address: '',
    image: null
  });
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [mlValidation, setMlValidation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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

  const mapRef = useRef();

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setFormData({ ...formData, address: data.display_name });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          getAddressFromCoords(newLocation.latitude, newLocation.longitude);
          
          // Center map on user location
          if (mapRef.current) {
            mapRef.current.setView([newLocation.latitude, newLocation.longitude], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      alert('Please log in first');
      navigate('/login');
      return;
    }

    if (!location.latitude || !location.longitude) {
      alert('Please get your location first');
      return;
    }

    if (!formData.image) {
      alert("Image is required to submit report");
      return;
    }
    
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('address', formData.address);
    data.append('latitude', location.latitude);
    data.append('longitude', location.longitude);
    data.append('created_by', user.id);                // ✅ REQUIRED

    if (formData.image) {
      data.append('image', formData.image);            // backend must handle upload → image_url
    }

    try {
        const res = await api.post('/issues', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
            // Authorization header is automatically added by interceptor
          }
        });

      alert('Issue reported successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Something went wrong';
      
      // Check if it's a waste validation error
      if (err.response?.data?.isWaste === false) {
        alert(`❌ ${errorMsg}\n\nThe AI model detected that this image does not contain waste or civic issues. Please upload a relevant image.`);
      } else {
        alert(errorMsg);
      }
      setSubmitting(false);
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
            <label>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Street address or landmark"
              value={formData.address}
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
            <label>Image</label>
            <ImageUpload
              onImageSelect={async (file) => {
                setFormData({ ...formData, image: file });
                setMlValidation({ loading: true });
                
                // Validate image with ML model
                try {
                  const data = new FormData();
                  data.append('file', file);
                  const res = await api.post('/classify', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  setMlValidation({
                    isWaste: res.data.waste,
                    confidence: (res.data.probability * 100).toFixed(1)
                  });
                } catch (err) {
                  console.error('ML validation error:', err);
                  setMlValidation({ error: true });
                }
              }}
              mlValidation={mlValidation}
            />
          </div>

          
          <div className="form-group">
            <label>Location</label>
            <button type="button" onClick={getLocation} className="location-btn">
              📍 Get Current Location
            </button>
            
            <div style={{ marginTop: '15px', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
              <MapContainer
                center={[20.5937, 78.9629]} // India center
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker 
                  position={location} 
                  setPosition={setLocation}
                  onLocationChange={getAddressFromCoords}
                />
              </MapContainer>
            </div>
            
            {location.latitude && (
              <p className="location-coords" style={{ marginTop: '10px', fontSize: '14px', color: '#16a34a' }}>
                ✓ Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              💡 Click on map or drag marker to adjust location
            </p>
          </div>
          
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
