// frontend/src/components/IssueCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';

const IssueCard = ({ issue, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(issue.shares || 0);

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

  const handleShare = async (platform) => {
    const url = `${window.location.origin}/issues/${issue.id}`;
    const text = `Check out this civic issue: ${issue.title}`;
    let shareUrl = '';
    switch(platform) {
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'copy': navigator.clipboard.writeText(url); alert('Link copied!'); setShowShareModal(false); return;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/issues/${issue.id}/share`, { method: 'POST' });
      const data = await response.json();
      setShareCount(data.shares);
    } catch (error) { console.error('Error:', error); }
    setShowShareModal(false);
  };

  const statusConfig = getStatusConfig(issue.status);
  const categoryConfig = getCategoryConfig(issue.category);

  return (
    <div className="issue-card">
      <div className="card-image-section">
        {issue.image_url && (
          <img
            src={issue.image_url}
            alt={issue.title}
            className="card-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
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
            <button className="engagement-btn" style={{ cursor: 'default' }}>
              <span className="engagement-icon">👁️</span>
              <span className="engagement-count">{issue.views || 0}</span>
            </button>
            <button className="engagement-btn" onClick={(e) => { e.preventDefault(); setShowShareModal(true); }}>
              <span className="engagement-icon">🔗</span>
              <span className="engagement-count">{shareCount}</span>
            </button>
          </div>

          {issue.creator_name && (
            <div className="creator-info">
              <span className="created-by">Reported by {issue.creator_name}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                const url = `https://www.google.com/maps/dir/?api=1&destination=${issue.latitude},${issue.longitude}`;
                window.open(url, '_blank');
              }}
              style={{
                padding: '8px 12px',
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              🧭 Navigate
            </button>
            <Link to={`/issues/${issue.id || issue._id}`} className="details-link">
              View Details →
            </Link>
          </div>
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
        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowShareModal(false)}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1rem' }}>Share Issue</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => handleShare('whatsapp')} style={{ padding: '0.75rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📱 WhatsApp</button>
                <button onClick={() => handleShare('twitter')} style={{ padding: '0.75rem', background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🐦 Twitter</button>
                <button onClick={() => handleShare('facebook')} style={{ padding: '0.75rem', background: '#1877F2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📘 Facebook</button>
                <button onClick={() => handleShare('copy')} style={{ padding: '0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📋 Copy Link</button>
              </div>
              <button onClick={() => setShowShareModal(false)} style={{ marginTop: '1rem', padding: '0.5rem', width: '100%', border: '1px solid #ddd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
