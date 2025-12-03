import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './ReportIssue.css';
import ImageUpload from "../components/ImageUpload";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'waste',
    image: null
  });

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, image: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    if (!location.latitude || !location.longitude) {
      alert("Please upload/capture an image to detect your location");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("latitude", location.latitude);
    data.append("longitude", location.longitude);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const res = await api.post("/issues", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log(res.data);
      alert("Issue reported successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="report-issue">
      <div className="container">
        <h1>Report a Cleanliness Issue</h1>

        <form onSubmit={handleSubmit} className="issue-form">
          
          {/* Title */}
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

          {/* Description */}
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

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="waste">Waste</option>
              <option value="drainage">Drainage</option>
              <option value="graffiti">Graffiti</option>
              <option value="street_cleaning">Street Cleaning</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label>Image (Optional)</label>
            <ImageUpload
              onImageSelect={(file) =>
                setFormData({ ...formData, image: file })
              }
              onLocationDetect={(loc) => setLocation(loc)}
            />
          </div>

          {/* LOCATION + MAP */}
          <div className="form-group">
            <label>Location</label>

            {!location.latitude && (
              <p style={{ color: "gray" }}>
                📍 Location will be detected after you upload or capture an image.
              </p>
            )}

            {location.latitude && (
              <div className="map-wrapper">
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={17}
                  scrollWheelZoom={false}
                  className="leaflet-container"
                >
                  <TileLayer
                     url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                     attribution="&copy; Stadia Maps, OSM contributors"
                  />


                  <Marker
                    position={[location.latitude, location.longitude]}
                    icon={markerIcon}
                  >
                    <Popup>Your Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
