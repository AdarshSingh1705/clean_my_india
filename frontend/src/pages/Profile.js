// frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userIssues, setUserIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserIssues();
    }
  }, [currentUser]);

  const fetchUserIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');

      // Normalize API response to an array
      let allIssues = [];
      if (Array.isArray(response.data)) {
        allIssues = response.data;
      } else if (Array.isArray(response.data.issues)) {
        allIssues = response.data.issues;
      } else if (response.data.issue) {
        allIssues = [response.data.issue];
      }

      // Filter issues created by current user filteredIssues
    const filteredIssues = allIssues.filter(issue => issue.user_id === currentUser.id);

      setUserIssues(filteredIssues);

      // Update stats
      const totalIssues = filteredIssues.length;
      const resolvedIssues = filteredIssues.filter(
        (issue) => issue.status === 'resolved'
      ).length;
      const pendingIssues = totalIssues - resolvedIssues;

      setStats({ totalIssues, resolvedIssues, pendingIssues });
    } catch (error) {
      console.error('Error fetching user issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="profile"><p>Loading user...</p></div>;
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <div className="user-info">
            <div className="avatar" style={{background: '#3498db', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', margin: '0 auto 1rem'}}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2>{currentUser.name}</h2>
            <p>{currentUser.email}</p>
            <p className="user-role">Role: {currentUser.role}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>{stats.totalIssues}</h3>
            <p>Total Reports</p>
            <span role="img" aria-label="reports" style={{fontSize: '1.5rem'}}>📝</span>
          </div>
          <div className="stat-card">
            <h3>{stats.resolvedIssues}</h3>
            <p>Resolved Issues</p>
            <span role="img" aria-label="resolved" style={{fontSize: '1.5rem'}}>✅</span>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingIssues}</h3>
            <p>Pending Issues</p>
            <span role="img" aria-label="pending" style={{fontSize: '1.5rem'}}>⏳</span>
          </div>
        </div>

        <div className="user-issues">
          <h2>Your Reported Issues</h2>
          {loading ? (
            <p>Loading issues...</p>
          ) : userIssues.length === 0 ? (
            <p>You haven't reported any issues yet.</p>
          ) : (
            <div className="issues-list">
              {userIssues.map((issue) => (
                <div key={issue.id || issue._id} className="issue-item">
                  <h3>{issue.title}</h3>
                  <p>{issue.description}</p>
                  <div className="issue-meta">
                    <span className={`status ${issue.status}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
