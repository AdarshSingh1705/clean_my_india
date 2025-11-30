import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Profile.css';

// Simple icon components
const EditIcon = () => <span>📋</span>;
const SettingsIcon = () => <span>⚙️</span>;
const InfoIcon = () => <span>ℹ️</span>;
const HelpIcon = () => <span>💬</span>;
const LogoutIcon = () => <span>🚪</span>;

// -------------------------------------------
// MAIN COMPONENT
// -------------------------------------------
const Profile = () => {
  const { currentUser, setCurrentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info");
  const [userIssues, setUserIssues] = useState([]);

  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
  });

  const [loading, setLoading] = useState(true);

  // Editable fields
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // -------------------------
  // LOAD USER DATA ON START
  // -------------------------
  useEffect(() => {
    if (currentUser) {
      fetchUserIssues();
      setEditData({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  // -------------------------
  // GET USER'S ISSUES
  // -------------------------
  const fetchUserIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/issues');

      let issues = response.data.issues || response.data || [];
      const filtered = issues.filter(
        (issue) => issue.user_id === currentUser.id
      );

      setUserIssues(filtered);
      setStats({
        totalIssues: filtered.length,
        resolvedIssues: filtered.filter(i => i.status === "resolved").length,
        pendingIssues: filtered.filter(i => i.status !== "resolved").length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // HANDLE LOGOUT
  // -------------------------
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // -------------------------
  // SAVE EDITED PROFILE
  // -------------------------
  const saveProfile = async () => {
    try {
      const res = await api.put(`/auth/update-profile`, editData);

      // Update Local Auth Context
      setCurrentUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Profile updated successfully!");
      setActiveTab("info");
    } catch (err) {
      console.log(err);
      alert("Failed to update profile");
    }
  };

  if (!currentUser) return <p>Loading...</p>;

  // -------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------
  return (
    <div className="profile-container">

      {/* ------------------- SIDEBAR ------------------------ */}
      <aside className="sidebar">
        <h2 className="sidebar-title">My Profile</h2>

        <ul className="menu">
          <li
            className={activeTab === "edit" ? "active" : ""}
            onClick={() => setActiveTab("edit")}
          >
            <EditIcon /> Edit Profile
          </li>

          <li
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            <SettingsIcon /> Settings
          </li>

          <li
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            <InfoIcon /> Info
          </li>

          <li
            className={activeTab === "help" ? "active" : ""}
            onClick={() => setActiveTab("help")}
          >
            <HelpIcon /> Help
          </li>
        </ul>

        <div className="logout" onClick={handleLogout}>
          <LogoutIcon /> Logout
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT -------------------- */}
      <main className="main-content">

        {/* ✨ TAB 1: USER INFO */}
        {activeTab === "info" && (
          <>
            <div className="profile-header">
              <h1>👋 Welcome, {currentUser.name}</h1>
              <p>Manage your reports and stay updated!</p>
            </div>

            <section className="user-info-card">
              <div className="info-item">
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div className="info-item">
                <strong>Phone:</strong> {currentUser.phone || "Not added"}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {currentUser.role}
              </div>
            </section>

            {/* Issues List */}
            <section className="issues-section">
              <h2>Your Issues</h2>

              {loading ? (
                <p>Loading...</p>
              ) : userIssues.length === 0 ? (
                <p>No issues reported yet.</p>
              ) : (
                userIssues.map((issue) => (
                  <div className="issue-item" key={issue.id}>
                    <h3>{issue.title}</h3>
                    <p>{issue.description}</p>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* ✨ TAB 2: EDIT PROFILE */}
        {activeTab === "edit" && (
          <section className="edit-profile-section">
            <h2>Edit Profile</h2>

            <div className="edit-form">
              <label>Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />

              <label>Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />

              <label>Phone</label>
              <input
                type="text"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
              />

              <button className="save-btn" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          </section>
        )}

        {/* ✨ TAB 3: SETTINGS */}
        {activeTab === "settings" && (
          <section className="settings-section">
            <h2>Settings</h2>
            <p>More settings will come soon.</p>
          </section>
        )}

        {/* ✨ TAB 4: HELP */}
        {activeTab === "help" && (
          <section className="help-section">
            <h2>Help</h2>
            <p>Contact support at: support@cleanindia.com</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Profile;
