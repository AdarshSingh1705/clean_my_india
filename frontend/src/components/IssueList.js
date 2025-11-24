import React, { useState, useEffect } from "react";
import axios from "axios";

const IssueList = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues");
      setIssues(res.data);
    } catch (err) {
      console.error("Error loading issues:", err);
    }
  };

  return (
    <div>
      <h2>Reported Issues (Raw List)</h2>
      {issues.length === 0 ? (
        <p>No issues reported yet.</p>
      ) : (
        <ul>
          {issues.map((issue) => (
            <li key={issue.id}>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>
              <p>Category: {issue.category}</p>
              <p>Status: {issue.status}</p>
              <p>
                Location: {issue.latitude}, {issue.longitude}
              </p>
              {issue.image_url && (
                <img src={issue.image_url} alt={issue.title} width="200" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueList;
