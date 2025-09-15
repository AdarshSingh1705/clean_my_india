// frontend/src/components/IssueCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';

const IssueCard = ({ issue, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="status-badge resolved">Resolved</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">In Progress</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'waste':
        return '🗑️';
      case 'drainage':
        return '💧';
      case 'graffiti':
        return '🎨';
      case 'street_cleaning':
        return '🧹';
      default:
        return '📍';
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(issue.id, commentText); // Pass both issue id and text
      setCommentText("");
    }
  };

  return (
    <div className="issue-card">
      <div className="issue-image">
        {issue.image_url && <img src={issue.image_url} alt={issue.title} />}
        {getStatusBadge(issue.status)}
      </div>

      <div className="issue-content">
        <div className="issue-meta">
          <span className="category">
            {getCategoryIcon(issue.category)} {issue.category}
          </span>
          <span className="date">{new Date(issue.created_at).toLocaleDateString()}</span>
        </div>

        <h3>{issue.title}</h3>
        <p>{issue.description}</p>

        <div className="issue-footer">
          <div className="issue-stats">
            <button onClick={onLike}>👍 {issue.likes}</button>
            <span>💬 {issue.comments}</span>
          </div>

          {issue.creator_name && <div className="creator">By {issue.creator_name}</div>}

          <Link to={`/issues/${issue.id || issue._id}`} className="view-details">
            View Details
          </Link>
        </div>

        {/* Comment Box */}
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default IssueCard;
