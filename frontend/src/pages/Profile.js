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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (currentUser) fetchUserIssues();
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
        (issue) => issue.user_id === currentUser.id
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
      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">My Profile</h2>

        <ul className="menu">
          <li>
            <EditIcon />
            <span>Edit Profile</span>
          </li>
          <li>
            <SettingsIcon />
            <span>Settings</span>
          </li>
          <li>
            <InfoIcon />
            <span>Info</span>
          </li>
          <li>
            <HelpIcon />
            <span>Help</span>
          </li>
        </ul>

        <div className="logout" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="profile-header">
          <h1>👋 Welcome, {currentUser.name}</h1>
          <p>We're glad to have you here. Manage your reports and stay updated on progress!</p>
        </div>

        {/* User Info */}
        <section className="user-info-card">
          <div className="info-item">
            <span className="info-label">📧 Email:</span>
            <span className="info-value">{currentUser.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🧾 Role:</span>
            <span className="info-value role-badge">{currentUser.role}</span>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📊</div>
            <h3 className="stat-value">{stats.totalIssues}</h3>
            <p className="stat-label">Total Reports</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon resolved">✅</div>
            <h3 className="stat-value">{stats.resolvedIssues}</h3>
            <p className="stat-label">Resolved</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <h3 className="stat-value">{stats.pendingIssues}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </section>

        {/* Issues */}
        <section className="issues-section">
          <h2>📝 Your Reported Issues</h2>

          {loading ? (
            <p className="loading">Loading issues...</p>
          ) : userIssues.length === 0 ? (
            <p className="no-issues">You haven't reported any issues yet.</p>
          ) : (
            <div className="issues-list">
              {userIssues.map((issue) => (
                <div className="issue-item" key={issue.id || issue._id}>
                  <h3 className="issue-title">{issue.title}</h3>
                  <p className="issue-description">{issue.description}</p>
                  <div className="issue-meta">
                    <span className={`status ${issue.status.replace('_', '-')}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className="issue-date">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;
