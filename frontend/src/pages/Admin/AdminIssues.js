import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminIssues.css";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues/admin/all");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load issues");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/issues/admin/${id}/status`, { status });
      fetchIssues();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const assignIssue = async (id, staffId) => {
    try {
      await api.patch(`/issues/admin/${id}/assign`, { staff_id: staffId });
      fetchIssues();
    } catch (err) {
      console.error(err);
      alert("Failed to assign issue");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">🛠️ Admin Issue Management</h1>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created By</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td>{issue.title}</td>
                <td>
                  <span className={`status-badge ${issue.status}`}>
                    {issue.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${issue.priority}`}>
                    {issue.priority}
                  </span>
                </td>
                <td>{issue.created_by_name || "User"}</td>
                <td>{issue.assigned_to_name || "None"}</td>
                <td className="admin-actions">
                  <select
                    className="admin-select"
                    onChange={(e) => updateStatus(issue.id, e.target.value)}
                  >
                    <option value="">Update Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Staff ID"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") assignIssue(issue.id, e.target.value);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIssues;

