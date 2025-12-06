// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import IssueCard from '../components/IssueCard';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my-issues');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
  });

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
    }
  }, [activeTab, currentUser]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');

      let allIssues = [];
      if (Array.isArray(response.data)) {
        allIssues = response.data;
      } else if (Array.isArray(response.data.issues)) {
        allIssues = response.data.issues.map(i => ({
          ...i,
          views: i.views ?? 0,
          shares: i.shares ?? 0,
          comment_count: i.comment_count ?? 0,
          like_count: i.like_count ?? 0
        }));
      } else if (response.data.issue) {
        allIssues = [response.data.issue];
      }

      let filteredIssues = allIssues;

      if (activeTab === 'my-issues') {
        filteredIssues = allIssues.filter(
          (issue) => issue.created_by === currentUser?.id
        );
      } else if (activeTab === 'resolved') {
        filteredIssues = allIssues.filter(
          (issue) => issue.status === 'resolved'
        );
      }

      setIssues(filteredIssues);

      const totalIssues = filteredIssues.length;
      const resolvedIssues = filteredIssues.filter(
        (issue) => issue.status === 'resolved'
      ).length;
      const pendingIssues = totalIssues - resolvedIssues;

      setStats({ totalIssues, resolvedIssues, pendingIssues });
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Like
  const handleLike = async (issueId) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      await api.post(`/likes/${issueId}`);
      fetchIssues();
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Error liking issue:', err);
      }
    }
  };

  // Handle Comment
  const handleComment = async (issueId, text) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      await api.post(`/comments/${issueId}/comment`, { text });
      fetchIssues();
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {currentUser?.name || 'User'}!</h1>
          <Link to="/report" className="report-button">
            Report New Issue
          </Link>
        </div>

        <div className="dashboard-stats">
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

        <div className="dashboard-tabs">
          <button
            className={`btn-primary${activeTab === 'my-issues' ? ' active' : ''}`}
            onClick={() => setActiveTab('my-issues')}
          >
            My Issues
          </button>
          <button
            className={`btn-primary${activeTab === 'nearby-issues' ? ' active' : ''}`}
            onClick={() => setActiveTab('nearby-issues')}
          >
            Nearby Issues
          </button>
          <button
            className={`btn-primary${activeTab === 'resolved' ? ' active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved Issues
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading issues...</div>
        ) : (
          <>
            <div className="issues-grid">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id || issue._id}
                  issue={issue}
                  onLike={() => handleLike(issue.id || issue._id)}
                  onComment={(text) => handleComment(issue.id || issue._id, text)}
                />
              ))}
            </div>

            {issues.length === 0 && (
              <div className="empty-state">
                <h3>No issues found</h3>
                <p>You haven't reported any issues yet. Start by reporting one!</p>
                <Link to="/report" className="cta-button">
                  Report Your First Issue
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
