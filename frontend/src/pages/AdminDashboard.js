import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchStats();
      fetchRecentIssues();
      fetchUsers();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentIssues = async () => {
    try {
      const response = await api.get('/issues?limit=10');
      setRecentIssues(response.data.issues);
    } catch (error) {
      console.error('Error fetching recent issues:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <h1>Access Denied</h1>
          <p>You need to be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'issues' ? 'active' : ''}
            onClick={() => setActiveTab('issues')}
          >
            Issues
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalIssues}</h3>
                <p>Total Issues</p>
              </div>
              <div className="stat-card">
                <h3>{stats.resolvedIssues}</h3>
                <p>Resolved Issues</p>
              </div>
              <div className="stat-card">
                <h3>{stats.pendingIssues}</h3>
                <p>Pending Issues</p>
              </div>
            </div>

            <div className="recent-issues">
              <h2>Recent Issues</h2>
              {recentIssues.length === 0 ? (
                <p>No recent issues</p>
              ) : (
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIssues.map(issue => (
                      <tr key={issue.id}>
                        <td>{issue.title}</td>
                        <td>{issue.category}</td>
                        <td>
                          <span className={`status ${issue.status}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>User Management</h2>
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role} 
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="official">Official</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="issues-tab">
            <h2>All Issues</h2>
            <div className="filters">
              <select>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select>
                <option value="all">All Categories</option>
                <option value="waste">Waste</option>
                <option value="drainage">Drainage</option>
                <option value="graffiti">Graffiti</option>
              </select>
            </div>
            <p>Issue management interface would go here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
