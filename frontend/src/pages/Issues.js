import React, { useState, useEffect } from "react";
import IssueCard from "../components/IssueCard";
import axios from "axios";
import "./Issues.css";

const Issues = () => {
  // Mock Data (for instant UI)
  const mockIssues = [
    {
      id: 1,
      title: "Garbage pile near market",
      description: "Large pile of garbage accumulating near the main market area",
      category: "waste",
      status: "in_progress",
      latitude: 28.6139,
      longitude: 77.209,
      image_url: "https://via.placeholder.com/300x200",
      created_at: "2023-05-15T10:30:00Z",
      comments: 3,
      likes: 5,
      creator_name: "Rahul Sharma",
    },
    {
      id: 2,
      title: "Blocked drainage in sector 5",
      description: "Drainage blocked causing water logging during rains",
      category: "drainage",
      status: "resolved",
      latitude: 28.6139,
      longitude: 77.209,
      image_url: "https://via.placeholder.com/300x200",
      created_at: "2023-05-10T14:22:00Z",
      comments: 7,
      likes: 12,
      creator_name: "Priya Singh",
    },
    {
      id: 3,
      title: "Graffiti on public walls",
      description: "Public walls covered with graffiti in the city center",
      category: "graffiti",
      status: "pending",
      latitude: 28.6139,
      longitude: 77.209,
      image_url: "https://via.placeholder.com/300x200",
      created_at: "2023-05-18T16:45:00Z",
      comments: 2,
      likes: 3,
      creator_name: "Amit Kumar",
    },
  ];

  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues");
      if (res.data && Array.isArray(res.data)) {
        // normalize if backend sends different field names
        const normalized = res.data.map((i) => ({
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
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
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
