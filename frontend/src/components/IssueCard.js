// frontend/src/components/IssueCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';

const IssueCard = ({ issue, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      resolved: { label: 'Resolved', class: 'resolved', icon: '✓' },
      in_progress: { label: 'In Progress', class: 'in-progress', icon: '⟳' },
      pending: { label: 'Pending', class: 'pending', icon: '⏱' }
    };
    return configs[status] || configs.pending;
  };

  const getCategoryConfig = (category) => {
    const configs = {
      waste: { icon: '🗑️', label: 'Waste Management' },
      drainage: { icon: '💧', label: 'Drainage' },
      graffiti: { icon: '🎨', label: 'Graffiti' },
      street_cleaning: { icon: '🧹', label: 'Street Cleaning' },
      default: { icon: '📍', label: 'General Issue' }
    };
    return configs[category] || configs.default;
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
      setIsCommenting(false);
    }
  };

  const statusConfig = getStatusConfig(issue.status);
  const categoryConfig = getCategoryConfig(issue.category);

  return (
    <div className="issue-card">
      <div className="card-image-section">
        {issue.image_url && (
          <img
            src={issue.image_url.startsWith('http') ? issue.image_url : `https://clean-india-j4w0.onrender.com${issue.image_url}`}
            alt={issue.title}
            className="card-image"
          />
        )}
        <div className={`status-indicator ${statusConfig.class}`}>
          <span className="status-icon">{statusConfig.icon}</span>
          {statusConfig.label}
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <div className="category-tag">
            <span className="category-icon">{categoryConfig.icon}</span>
            {categoryConfig.label}
          </div>
          <time className="date-posted">
            {new Date(issue.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
        </div>

        <h3 className="issue-title">{issue.title}</h3>
        <p className="issue-description">{issue.description}</p>

        <div className="card-footer">
          <div className="engagement-metrics">
            <button 
              className="engagement-btn like-btn" 
              onClick={onLike}
              aria-label="Like this issue"
            >
              <span className="engagement-icon">👍</span>
              <span className="engagement-count">{issue.like_count || issue.likes || 0}</span>
            </button>
            
            <button 
              className="engagement-btn comment-btn" 
              onClick={() => setIsCommenting(!isCommenting)}
              aria-label="Add comment"
            >
              <span className="engagement-icon">💬</span>
              <span className="engagement-count">{issue.comment_count || 0}</span>
            </button>
          </div>

          {issue.creator_name && (
            <div className="creator-info">
              <span className="created-by">Reported by {issue.creator_name}</span>
            </div>
          )}

          <Link to={`/issues/${issue.id || issue._id}`} className="details-link">
            View Details →
          </Link>
        </div>

        {isCommenting && (
          <form onSubmit={handleCommentSubmit} className="comment-section">
            <div className="comment-input-group">
              <input
                type="text"
                placeholder="Add a professional comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-input"
                autoFocus
              />
              <button type="submit" className="comment-submit-btn">
                Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
