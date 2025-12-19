import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const UserProfileView = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [viewedUser, setViewedUser] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    assignedCount: 0,
    assignedCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [userRes, issuesRes] = await Promise.all([
        api.get(`/admin/users`),
        api.get('/issues')
      ]);

      const user = userRes.data.users.find(u => u.id === parseInt(userId));
      if (!user) {
        alert('User not found');
        navigate('/admin');
        return;
      }

      setViewedUser(user);

      let allIssues = [];
      if (Array.isArray(issuesRes.data)) allIssues = issuesRes.data;
      else if (Array.isArray(issuesRes.data.issues)) allIssues = issuesRes.data.issues;

      const filtered = allIssues.filter(issue => issue.created_by === user.id);
      const assigned = allIssues.filter(issue => issue.assigned_to === user.id);

      setUserIssues(filtered);
      setAssignedIssues(assigned);

      setStats({
        totalIssues: filtered.length,
        resolvedIssues: filtered.filter(i => i.status === 'resolved').length,
        pendingIssues: filtered.length - filtered.filter(i => i.status === 'resolved').length,
        assignedCount: assigned.filter(i => i.status !== 'resolved' && i.status !== 'closed').length,
        assignedCompleted: assigned.filter(i => i.status === 'resolved' || i.status === 'closed').length,
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load user profile');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Total", value: stats.totalIssues },
    { name: "Resolved", value: stats.resolvedIssues },
    { name: "Pending", value: stats.pendingIssues },
  ];

  if (loading) return <p className="loading">Loading...</p>;
  if (!viewedUser) return null;

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="avatar-circle">
            {viewedUser.name.charAt(0).toUpperCase()}
          </div>
          <h2>{viewedUser.name}</h2>
          <p>{viewedUser.email}</p>
          <span className="role-badge">{viewedUser.role}</span>
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
            🔒 Read-Only View
          </div>
        </div>
        <button 
          className="logout-btn" 
          onClick={() => navigate('/admin')}
          style={{ background: '#e5e7eb', color: '#374151' }}
        >
          ← Back to Admin
        </button>
      </aside>

      <main className="profile-main">
        <div className="content-header">
          <h1>User Dashboard Overview</h1>
          <p>Viewing {viewedUser.name}'s profile</p>
        </div>

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
          {(viewedUser.role === 'official' || viewedUser.role === 'admin') && (
            <>
              <div className="stat-box">
                <div className="stat-icon purple">👤</div>
                <div className="stat-info">
                  <h3>{stats.assignedCount}</h3>
                  <p>Assigned to User</p>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon green">✔️</div>
                <div className="stat-info">
                  <h3>{stats.assignedCompleted}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </>
          )}
        </section>

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

        {(viewedUser.role === 'official' || viewedUser.role === 'admin') && assignedIssues.length > 0 && (
          <section className="issues-section">
            <div className="section-header">
              <h2>🎯 Issues Assigned to User</h2>
            </div>
            <div className="issues-list">
              {assignedIssues.map((issue) => (
                <div className="issue-item" key={issue.id}>
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
          </section>
        )}

        <section className="issues-section">
          <div className="section-header">
            <h2>User's Reported Issues</h2>
          </div>
          {userIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Issues Reported</h3>
              <p>This user hasn't reported any issues yet.</p>
            </div>
          ) : (
            <div className="issues-list">
              {userIssues.map((issue) => (
                <div className="issue-item" key={issue.id}>
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
    </div>
  );
};

export default UserProfileView;
