import React, { useEffect, useState } from "react";
import api from "../../services/api";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Issue Management</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
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
            <tr key={issue.id} className="border-b">
              <td>{issue.title}</td>
              <td>{issue.status}</td>
              <td>{issue.priority}</td>
              <td>{issue.created_by_name || "User"}</td>
              <td>{issue.assigned_to_name || "None"}</td>
              <td className="flex gap-2">
                <select
                  onChange={(e) => updateStatus(issue.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="">Update Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <input
                  type="number"
                  placeholder="Staff ID"
                  className="border p-1"
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
  );
};

export default AdminIssues;
