// // frontend/src/pages/Profile.js
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import api from '../services/api';
// import './Profile.css';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from "recharts";

// const Profile = () => {
//   const { currentUser } = useAuth();
//   const [userIssues, setUserIssues] = useState([]);
//   const [stats, setStats] = useState({
//     totalIssues: 0,
//     resolvedIssues: 0,
//     pendingIssues: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (currentUser) {
//       fetchUserIssues();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUser]);

//   const fetchUserIssues = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/issues');

//       // Normalize API response to an array
//       let allIssues = [];
//       if (Array.isArray(response.data)) {
//         allIssues = response.data;
//       } else if (Array.isArray(response.data.issues)) {
//         allIssues = response.data.issues;
//       } else if (response.data.issue) {
//         allIssues = [response.data.issue];
//       }

//       // Filter issues created by current user
//       const filteredIssues = allIssues.filter(
//         (issue) => issue.user_id === currentUser.id
//       );

//       setUserIssues(filteredIssues);

//       // Update stats
//       const totalIssues = filteredIssues.length;
//       const resolvedIssues = filteredIssues.filter(
//         (issue) => issue.status === 'resolved'
//       ).length;
//       const pendingIssues = totalIssues - resolvedIssues;

//       setStats({ totalIssues, resolvedIssues, pendingIssues });
//     } catch (error) {
//       console.error('Error fetching user issues:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!currentUser) {
//     return (
//       <div className="profile">
//         <p>Loading user...</p>
//       </div>
//     );
//   }

//   // sample data for chart — uses real stats
//   const chartData = [
//     { name: "Reports", value: stats.totalIssues || 0 },
//     { name: "Resolved", value: stats.resolvedIssues || 0 },
//     { name: "Pending", value: stats.pendingIssues || 0 },
//   ];

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
//       {/* LEFT SIDEBAR (unchanged) */}
//       <div
//         style={{
//           width: '25%',
//           background: '#ffffff',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
//           padding: '24px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//           borderTopRightRadius: '18px',
//           borderBottomRightRadius: '18px'
//         }}
//       >
//         <div>
//           <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#16a34a', marginBottom: '1rem' }}>
//             My Profile
//           </h2>
//           <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#374151', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
//             <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
//               🧑‍💼 <span>Edit Profile</span>
//             </li>
//             <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
//               ⚙️ <span>Settings</span>
//             </li>
//             <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
//               ℹ️ <span>Info</span>
//             </li>
//             <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
//               💬 <span>Help</span>
//             </li>
//           </ul>
//         </div>

//         <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '1.25rem', color: '#ef4444', cursor: 'pointer' }}>
//           🚪 Logout
//         </div>
//       </div>

//       {/* RIGHT CONTENT - CENTERED and ENHANCED */}
//       <div
//         style={{
//           flex: 1,
//           padding: '40px',
//           overflowY: 'auto',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <div
//           style={{
//             width: '100%',
//             maxWidth: '780px',
//             textAlign: 'center',
//             background: '#ffffff',
//             borderRadius: '16px',
//             padding: '32px',
//             boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
//           }}
//         >
//           {/* HEADER */}
//           <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
//             👋 Welcome, {currentUser?.name}
//           </h1>

//           <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1rem' }}>
//             We're glad to have you here. Manage your reports and stay updated on progress!
//           </p>

//           {/* USER INFO */}
//           <div
//             style={{
//               background: '#f9fafb',
//               border: '1px solid #e5e7eb',
//               borderRadius: '12px',
//               padding: '20px',
//               marginBottom: '28px',
//               textAlign: 'left'
//             }}
//           >
//             <p style={{ color: '#111827', fontWeight: 500 }}>
//               📧 Email: <span style={{ color: '#4b5563' }}>{currentUser?.email}</span>
//             </p>
//             <p style={{ color: '#111827', fontWeight: 500 }}>
//               🧾 Role: <span style={{ color: '#4b5563' }}>{currentUser?.role}</span>
//             </p>
//           </div>

//           {/* STATS */}
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(3,1fr)',
//               gap: '18px',
//               marginBottom: '28px'
//             }}
//           >
//             <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d', margin: 0 }}>
//                 {stats.totalIssues}
//               </h3>
//               <p style={{ color: '#374151', marginTop: '6px' }}>📊 Total Reports</p>
//             </div>
//             <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8', margin: 0 }}>
//                 {stats.resolvedIssues}
//               </h3>
//               <p style={{ color: '#374151', marginTop: '6px' }}>✅ Resolved</p>
//             </div>
//             <div style={{ background: '#fef9c3', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
//               <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
//                 {stats.pendingIssues}
//               </h3>
//               <p style={{ color: '#374151', marginTop: '6px' }}>⏳ Pending</p>
//             </div>
//           </div>

//           {/* VISUAL CHART - REPORT OVERVIEW */}
//           <div
//             style={{
//               background: '#fff',
//               borderRadius: '12px',
//               padding: '24px',
//               marginBottom: '28px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//             }}
//           >
//             <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
//               📈 Activity Overview
//             </h2>
//             <ResponsiveContainer width="100%" height={260}>
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="value" fill="#16a34a" barSize={45} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* REPORTED ISSUES */}
//           <div
//             style={{
//               background: '#f9fafb',
//               borderRadius: '12px',
//               padding: '20px',
//               boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
//               textAlign: 'left'
//             }}
//           >
//             <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
//               📝 Your Reported Issues
//             </h2>

//             {loading ? (
//               <p style={{ textAlign: 'center' }}>Loading issues...</p>
//             ) : userIssues.length === 0 ? (
//               <p style={{ textAlign: 'center', color: '#6b7280' }}>
//                 You haven’t reported any issues yet.
//               </p>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 {userIssues.map((issue) => (
//                   <div
//                     key={issue.id || issue._id}
//                     style={{
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '10px',
//                       padding: '14px',
//                       background: '#fff',
//                       transition: 'transform 0.2s, box-shadow 0.2s',
//                       cursor: 'pointer'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = 'scale(1.02)';
//                       e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'scale(1)';
//                       e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
//                     }}
//                   >
//                     <h3 style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{issue.title}</h3>
//                     <p style={{ color: '#4b5563', marginTop: '6px' }}>{issue.description}</p>
//                     <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
//                       <span>Status: <b>{issue.status}</b></span>
//                       <span>{new Date(issue.created_at).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;




// frontend/src/pages/Profile.js
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
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">My Profile</h2>

        <ul className="menu">
          <li>Edit Profile</li>
          <li>Settings</li>
          <li>Info</li>
          <li>Help</li>
        </ul>

        <div className="logout" onClick={handleLogout}>Logout</div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <div className="profile-header">
          <h1>👋 Hello, {currentUser.name}</h1>
          <p>Welcome back! Here is your activity overview.</p>
        </div>

        {/* User Info */}
        <section className="user-info-card">
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card green">
            <h3>{stats.totalIssues}</h3>
            <p>Total Reports</p>
          </div>
          <div className="stat-card blue">
            <h3>{stats.resolvedIssues}</h3>
            <p>Resolved</p>
          </div>
          <div className="stat-card yellow">
            <h3>{stats.pendingIssues}</h3>
            <p>Pending</p>
          </div>
        </section>

        {/* Chart */}
        <section className="chart-card">
          <h2>📊 Activity Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Issues */}
        <section className="issues-section">
          <h2>Your Reported Issues</h2>

          {loading ? (
            <p className="loading">Loading issues...</p>
          ) : userIssues.length === 0 ? (
            <p className="no-issues">No issues reported yet.</p>
          ) : (
            <div className="issues-list">
              {userIssues.map((issue) => (
                <div className="issue-item" key={issue.id || issue._id}>
                  <h3>{issue.title}</h3>
                  <p>{issue.description}</p>
                  <div className="issue-meta">
                    <span>Status: <b>{issue.status}</b></span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
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
