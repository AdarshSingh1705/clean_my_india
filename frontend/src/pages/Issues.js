import React, { useState, useEffect } from "react";
import IssueCard from "../components/IssueCard";
import axios from "axios";
import "./Issues.css";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues");
      let issuesArr = [];
      if (Array.isArray(res.data)) {
        issuesArr = res.data;
      } else if (Array.isArray(res.data.issues)) {
        issuesArr = res.data.issues;
      }
      if (issuesArr.length > 0) {
        const normalized = issuesArr.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          status: i.status,
          latitude: i.latitude,
          longitude: i.longitude,
          image_url: i.image_url,
          created_at: i.created_at,
          comments: i.comment_count ?? 0,
          likes: i.like_count ?? 0,
          creator_name: i.creator_name,
        }));
        setIssues(normalized);
      } else {
        setIssues([]);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]);
    }
  };

  // Optimistic Like
  const handleLike = async (id) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, likes: issue.likes + 1 } : issue
      )
    );
    try {
      await axios.post(`http://localhost:5000/api/issues/${id}/like`);
    } catch (err) {
      console.error(err);
      // rollback
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, likes: issue.likes - 1 } : issue
        )
      );
    }
  };

  // Optimistic Comment
  const handleComment = async (id, text) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, comments: issue.comments + 1 }
          : issue
      )
    );
    try {
      await axios.post(`http://localhost:5000/api/issues/${id}/comments`, {
        text,
      });
    } catch (err) {
      console.error(err);
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? { ...issue, comments: issue.comments - 1 }
            : issue
        )
      );
    }
  };

  const filteredIssues =
    filter === "all" ? issues : issues.filter((i) => i.status === filter);

  return (
    <div className="issues-page">
      <div className="container">
        <h1>Reported Issues</h1>

        {/* Filters */}
        <div className="filters">
          {["all", "pending", "in_progress", "resolved"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All Issues"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="issues-grid">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onLike={() => handleLike(issue.id)}
              onComment={(text) => handleComment(issue.id, text)}
            />
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="empty-state">
            <h3>No issues found</h3>
            <p>There are no issues matching your selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Issues;
