import React, { useState, useEffect, useRef, useCallback } from "react";
import IssueCard from "../components/IssueCard";
import api from "../services/api";
import "./Issues.css";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  useEffect(() => {
    setIssues([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);

  useEffect(() => {
    fetchIssues();
  }, [page, filter]);

  const fetchIssues = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const statusParam = filter === "all" ? "" : `&status=${filter}`;
      const res = await api.get(`/issues?page=${page}&limit=12${statusParam}`);
      const issuesArr = res.data.issues || [];
      
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
        comment_count: i.comment_count ?? 0,
        like_count: i.like_count ?? 0,
        views: i.views ?? 0,
        shares: i.shares ?? 0,
        creator_name: i.creator_name,
      }));
      
      setIssues(prev => page === 1 ? normalized : [...prev, ...normalized]);
      setHasMore(res.data.page < res.data.totalPages);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const lastIssueRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Toggle Like with optimistic update
  const handleLike = async (id) => {
    // Optimistically increment (assuming like operation)
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, likes: issue.likes + 1 } : issue
      )
    );
    try {
      const res = await api.post(`/likes/${id}`);
      // Update with the actual like count from server (handles both like and unlike)
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, likes: res.data.likes } : issue
        )
      );
    } catch (err) {
      console.error(err);
      // rollback optimistic update
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
      await api.post(`/comments/${id}/comment`, {
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
          {issues.map((issue, index) => {
            if (issues.length === index + 1) {
              return (
                <div ref={lastIssueRef} key={issue.id}>
                  <IssueCard
                    issue={issue}
                    onLike={() => handleLike(issue.id)}
                    onComment={(text) => handleComment(issue.id, text)}
                  />
                </div>
              );
            }
            return (
              <IssueCard
                key={issue.id}
                issue={issue}
                onLike={() => handleLike(issue.id)}
                onComment={(text) => handleComment(issue.id, text)}
              />
            );
          })}
        </div>

        {loading && <div className="loading">Loading more issues...</div>}

        {issues.length === 0 && !loading && (
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
