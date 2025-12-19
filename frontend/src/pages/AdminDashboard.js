import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [officials, setOfficials] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [activityLogs, setActivityLogs] = useState([]);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchStats();
      fetchRecentIssues();
      fetchUsers();
      fetchOfficials();
      if (activeTab === 'logs') fetchActivityLogs();
    }
  }, [currentUser, activeTab]);

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
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      const response = await api.get(`/issues?${params.toString()}`);
      setRecentIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching recent issues:', error);
    }
  };

  const fetchIssuesByFilter = async (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    try {
      const params = new URLSearchParams();
      const newFilters = { ...filters, [filterType]: value };
      if (newFilters.status) params.append('status', newFilters.status);
      if (newFilters.category) params.append('category', newFilters.category);
      const response = await api.get(`/issues?${params.toString()}`);
      setRecentIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching filtered issues:', error);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    // Prevent resolved/closed without proof
    if (newStatus === 'resolved' || newStatus === 'closed') {
      alert('To mark an issue as resolved or closed, please go to the issue detail page and upload proof image.');
      return;
    }
    
    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      setRecentIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
      alert('Issue status updated successfully');
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert(error.response?.data?.message || 'Failed to update issue status');
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await api.delete(`/issues/${issueId}`);
      setRecentIssues(prev => prev.filter(issue => issue.id !== issueId));
      alert('Issue deleted successfully');
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue');
    }
  };

  const assignIssue = async (issueId, officialId) => {
    try {
      await api.patch(`/issues/${issueId}/assign`, { assigned_to: officialId });
      setRecentIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, assigned_to: officialId } : issue
      ));
      alert('Issue assigned successfully');
    } catch (error) {
      console.error('Error assigning issue:', error);
      alert('Failed to assign issue');
    }
  };

  const updateIssuePriority = async (issueId, newPriority) => {
    try {
      await api.patch(`/admin/issues/${issueId}/priority`, { priority: newPriority });
      setRecentIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, priority: newPriority } : issue
      ));
      alert('Priority updated successfully');
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportIssues = () => {
    const exportData = recentIssues.map(issue => ({
      ID: issue.id,
      Title: issue.title,
      Category: issue.category,
      Priority: issue.priority,
      Status: issue.status,
      Reporter: issue.creator_name,
      Created: new Date(issue.created_at).toLocaleDateString(),
      Address: issue.address || 'N/A'
    }));
    exportToCSV(exportData, 'issues');
  };

  const exportUsers = () => {
    const exportData = users.map(user => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Joined: new Date(user.created_at).toLocaleDateString()
    }));
    exportToCSV(exportData, 'users');
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOfficials = async () => {
    try {
      const response = await api.get('/admin/users');
      const officialsList = response.data.users.filter(u => u.role === 'official');
      setOfficials(officialsList);
    } catch (error) {
      console.error('Error fetching officials:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      fetchOfficials();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateUserWard = async (userId, wardNumber) => {
    try {
      await api.patch(`/admin/users/${userId}/ward`, { ward_number: wardNumber });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ward_number: wardNumber } : user
      ));
      alert('Ward updated successfully');
    } catch (error) {
      console.error('Error updating ward:', error);
      alert('Failed to update ward');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/admin/activity-logs');
      setActivityLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
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
          <button 
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                onClick={async () => {
                  try {
                    await api.post('/admin/send-reminders');
                    alert('Reminder emails sent to officials!');
                  } catch (error) {
                    alert('Failed to send reminders');
                  }
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
              >
                📧 Send Reminders to Officials
              </button>
            </div>
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

            {/* Analytics Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Issues by Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: stats.pendingIssues, color: '#f59e0b' },
                        { name: 'Resolved', value: stats.resolvedIssues, color: '#10b981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[{ color: '#f59e0b' }, { color: '#10b981' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Issues by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { category: 'Pothole', count: recentIssues.filter(i => i.category === 'pothole').length },
                    { category: 'Garbage', count: recentIssues.filter(i => i.category === 'garbage').length },
                    { category: 'Water', count: recentIssues.filter(i => i.category === 'water_leakage').length },
                    { category: 'Drainage', count: recentIssues.filter(i => i.category === 'drainage').length },
                    { category: 'Other', count: recentIssues.filter(i => i.category === 'other').length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
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
                        <td>
                          <a 
                            href={`/issues/${issue.id}`}
                            style={{ color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                          >
                            {issue.title}
                          </a>
                        </td>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>User Management</h2>
              <button onClick={exportUsers} style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                📥 Export CSV
              </button>
            </div>
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ward</th>
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
                      <td>
                        {user.role === 'official' ? (
                          <input
                            type="number"
                            value={user.ward_number || ''}
                            onChange={(e) => updateUserWard(user.id, e.target.value)}
                            placeholder="Ward #"
                            style={{ width: '80px', padding: '0.25rem' }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <a 
                          href={`/admin/user-profile/${user.id}`}
                          style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '0.5rem', textDecoration: 'none', display: 'inline-block' }}
                        >
                          View Profile
                        </a>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Issues</h2>
              <button onClick={exportIssues} style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                📥 Export CSV
              </button>
            </div>
            <div className="filters">
              <select onChange={(e) => fetchIssuesByFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select onChange={(e) => fetchIssuesByFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="street_light">Street Light</option>
                <option value="drainage">Drainage</option>
                <option value="other">Other</option>
              </select>
            </div>
            {recentIssues.length === 0 ? (
              <p>No issues found</p>
            ) : (
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reporter</th>
                    <th>Created</th>
                    <th>Assign To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues.map(issue => (
                    <tr key={issue.id}>
                      <td>
                        <a 
                          href={`/issues/${issue.id}`}
                          style={{ color: '#3b82f6', textDecoration: 'none', cursor: 'pointer' }}
                          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {issue.title}
                        </a>
                      </td>
                      <td>{issue.category}</td>
                      <td>
                        <select 
                          value={issue.priority || 'medium'}
                          onChange={(e) => updateIssuePriority(issue.id, e.target.value)}
                          style={{ 
                            color: issue.priority === 'critical' ? '#dc2626' : 
                                   issue.priority === 'high' ? '#ea580c' : 
                                   issue.priority === 'low' ? '#16a34a' : '#3b82f6'
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          value={issue.status}
                          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>{issue.creator_name}</td>
                      <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                      <td>
                        <select 
                          value={issue.assigned_to || ''}
                          onChange={(e) => assignIssue(issue.id, e.target.value)}
                          style={{ marginRight: '10px' }}
                        >
                          <option value="">Unassigned</option>
                          {officials.map(official => (
                            <option key={official.id} value={official.id}>
                              {official.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button 
                          className="btn-danger"
                          onClick={() => deleteIssue(issue.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-tab">
            <h2 style={{ marginBottom: '1.5rem' }}>📋 Activity Logs</h2>
            {activityLogs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>No activity logs found</p>
            ) : (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>🕐 Time</th>
                    <th>👤 User</th>
                    <th>⚡ Action</th>
                    <th>📝 Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {log.user_name?.charAt(0).toUpperCase()}
                          </div>
                          {log.user_name}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default AdminDashboard;
