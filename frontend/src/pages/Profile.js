// frontend/src/pages/Profile.js (updated imports and icons)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Profile.css';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Simple icon components
const EditIcon = () => <span>📋</span>;
const SettingsIcon = () => <span>⚙️</span>;
const InfoIcon = () => <span>ℹ️</span>;
const HelpIcon = () => <span>💬</span>;
const LogoutIcon = () => <span>🚪</span>;

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userIssues, setUserIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserIssues();
      setEditForm({
        name: currentUser.name,
        email: currentUser.email
      });
    }
  }, [currentUser]);

  const fetchUserIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');

      let allIssues = [];
      if (Array.isArray(response.data)) allIssues = response.data;
      else if (Array.isArray(response.data.issues)) allIssues = response.data.issues;
      else if (response.data.issue) allIssues = [response.data.issue];

      const filtered = allIssues.filter(
        (issue) => issue.created_by === currentUser.id || issue.user_id === currentUser.id
      );

      setUserIssues(filtered);

      setStats({
        totalIssues: filtered.length,
        resolvedIssues: filtered.filter((i) => i.status === 'resolved').length,
        pendingIssues:
          filtered.length -
          filtered.filter((i) => i.status === 'resolved').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Total", value: stats.totalIssues },
    { name: "Resolved", value: stats.resolvedIssues },
    { name: "Pending", value: stats.pendingIssues },
  ];

  if (!currentUser) return <p className="loading">Loading...</p>;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="avatar-circle">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <h2>{currentUser.name}</h2>
          <p>{currentUser.email}</p>
          <span className="role-badge">{currentUser.role}</span>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setIsEditModalOpen(true)} className="nav-item active">
            <EditIcon /> Edit Profile
          </button>
          <a href="#" className="nav-item">
            <SettingsIcon /> Settings
          </a>
          <a href="#" className="nav-item">
            <InfoIcon /> Activity
          </a>
          <a href="#" className="nav-item">
            <HelpIcon /> Help
          </a>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogoutIcon /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="profile-main">

        {/* Overview Header */}
        <div className="content-header">
          <h1>Dashboard Overview</h1>
          <p>Track and manage your reported issues</p>
        </div>

        {/* Stats Cards */}
        <section className="stats-container">
          <div className="stat-box">
            <div className="stat-icon blue">📊</div>
            <div className="stat-info">
              <h3>{stats.totalIssues}</h3>
              <p>Total Issues</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{stats.resolvedIssues}</h3>
              <p>Resolved</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon orange">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingIssues}</h3>
              <p>Pending</p>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="chart-section">
          <h2>Statistics Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Issues Section */}
        <section className="issues-section">
          <div className="section-header">
            <h2>Your Reported Issues</h2>
            <button className="view-all-btn">View All</button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your issues...</p>
            </div>
          ) : userIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Issues Yet</h3>
              <p>Start by reporting your first civic issue!</p>
              <button className="btn-primary" onClick={() => window.location.href = '/report'}>
                Report Issue
              </button>
            </div>
          ) : (
            <div className="issues-list">
              {userIssues.map((issue) => (
                <div className="issue-item" key={issue.id || issue._id}>
                  <div className="issue-content">
                    <h3>{issue.title}</h3>
                    <p>{issue.description}</p>
                    <div className="issue-meta">
                      <span className={`status-badge ${issue.status}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className="issue-date">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.put('/users/profile', editForm);
                alert('Profile updated successfully!');
                setIsEditModalOpen(false);
                window.location.reload();
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to update profile');
              }
            }}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
