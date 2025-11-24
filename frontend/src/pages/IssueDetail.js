// IssueDetail.jsx (Complete)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import './IssueDetail.css';


const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const socket = useSocket();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);


  useEffect(() => {
    fetchIssueDetails();
    
    if (socket) {
      socket.emit('join-issue-room', id);
      
      socket.on('issue-updated', (updatedIssue) => {
        if (updatedIssue.id === parseInt(id)) {
          setIssue(updatedIssue);
        }
      });
      
      socket.on('new-comment', (comment) => {
        if (comment.issue_id === parseInt(id)) {
          setComments(prev => [...prev, comment]);
        }
      });
    }


    return () => {
      if (socket) {
        socket.emit('leave-issue-room', id);
        socket.off('issue-updated');
        socket.off('new-comment');
      }
    };
  }, [id, socket]);


  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/issues/${id}`);
      setIssue(response.data);
      setComments(response.data.comments || []);
      setLikeCount(response.data.like_count || 0);
      setUserLiked(response.data.user_liked || false);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      setError('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;


    if (!currentUser) {
      navigate('/login');
      return;
    }


    try {
      const response = await api.post(`/comments/${id}/comment`, {
        text: newComment.trim()
      });


      // Add the new comment to the list
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      setError('');


      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('new-comment', response.data.comment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  };


  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }


    try {
      if (userLiked) {
        await api.delete(`/likes/${id}`);
        setLikeCount(prev => prev - 1);
        setUserLiked(false);
      } else {
        await api.post(`/likes/${id}`);
        setLikeCount(prev => prev + 1);
        setUserLiked(true);
      }
      setError('');
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error.response?.data?.message || 'Failed to update like');
    }
  };


  const getStatusBadge = (status) => {
    switch(status) {
      case 'resolved':
        return <span className="status-badge resolved">Resolved</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">In Progress</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };


  const getCategoryIcon = (category) => {
    switch(category) {
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


  if (loading) {
    return (
      <div className="issue-detail">
        <div className="container">
          <p>Loading issue details...</p>
        </div>
      </div>
    );
  }


  if (error || !issue) {
    return (
      <div className="issue-detail">
        <div className="container">
          <p>{error || 'Issue not found'}</p>
          <button onClick={() => navigate('/issues')}>Back to Issues</button>
        </div>
      </div>
    );
  }


  return (
    <div className="issue-detail">
      <div className="container">
        {/* Main Content Area */}
        <div className="main-content">
          <button onClick={() => navigate('/issues')} className="back-button">
            ← Back to Issues
          </button>


          <div className="card">
            <div className="issue-header">
              <div className="issue-meta">
                <span className="category">{getCategoryIcon(issue.category)} {issue.category}</span>
                <span className="date">{new Date(issue.created_at).toLocaleDateString()}</span>
                {getStatusBadge(issue.status)}
              </div>
              <h1>{issue.title}</h1>
              <p className="creator">Reported by {issue.creator_name}</p>
            </div>


            <div className="issue-content">
              <div className="issue-description">
                <p>{issue.description}</p>
              </div>


              {issue.image_url && (
                <div className="issue-image">
                  <img src={`http://localhost:5000${issue.image_url}`} alt={issue.title} />
                </div>
              )}


              <div className="issue-location">
                <h3>Location</h3>
                <p>Latitude: {issue.latitude}, Longitude: {issue.longitude}</p>
                {/* In a real app, you would show a map here */}
              </div>


              <div className="issue-actions">
                <button 
                  onClick={handleLike} 
                  className={`like-btn ${userLiked ? 'liked' : ''}`}
                  title="Like this issue"
                >
                  <span role="img" aria-label="like">👍</span> {likeCount}
                </button>
                {currentUser && currentUser.role === 'official' && (
                  <div className="official-actions">
                    <button className="btn-primary">Mark as In Progress</button>
                    <button className="btn-success">Mark as Resolved</button>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Comments Section */}
          <div className="comments-section">
            <h2>Comments ({comments.length})</h2>
            
            {currentUser ? (
              <div className="comment-form">
                <div className="avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <form onSubmit={handleCommentSubmit} style={{ flex: 1 }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows="1"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={!newComment.trim()}
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '1rem' }}>
                <Link to="/login">Log in</Link> to add comments
              </p>
            )}


            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="avatar">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <strong>{comment.user_name}</strong>
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="comment-text">
                        {comment.text}
                      </div>
                      <div className="comment-actions">
                        <button className="comment-action">
                          👍 Like
                        </button>
                        <button className="comment-action">
                          💬 Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>


        {/* Sidebar */}
        <div className="sidebar">
          {/* Search Section */}

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3>⚡ Quick Actions</h3>
            <ul className="quick-links">
              <li>
                <Link to="/issues">
                  <span>📋</span> Browse All Issues
                </Link>
              </li>
              <li>
                <Link to="/report">
                  <span>➕</span> Report New Issue
                </Link>
              </li>
              {currentUser?.role === 'official' && (
                <li>
                  <Link to="/dashboard">
                    <span>📊</span> Official Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Statistics */}
          <div className="sidebar-section">
            <h3>📈 Issue Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="number">{likeCount}</div>
                <div className="label">Likes</div>
              </div>
              <div className="stat-card">
                <div className="number">{comments.length}</div>
                <div className="label">Comments</div>
              </div>
              <div className="stat-card">
                <div className="number">24</div>
                <div className="label">Views</div>
              </div>
              <div className="stat-card">
                <div className="number">3</div>
                <div className="label">Shares</div>
              </div>
            </div>
          </div>

          {/* Trending Issues */}
          <div className="sidebar-section">
            <h3>🔥 Trending Issues</h3>
            <ul className="trending-list">
              <li className="trending-item">
                <div className="avatar">JD</div>
                <div className="trending-content">
                  <h4>Road repair needed on Main Street</h4>
                  <div className="trending-meta">
                    <span>🚧 Infrastructure</span>
                    <span>📍 Downtown</span>
                  </div>
                </div>
              </li>
              <li className="trending-item">
                <div className="avatar">MS</div>
                <div className="trending-content">
                  <h4>Street lights not working</h4>
                  <div className="trending-meta">
                    <span>💡 Lighting</span>
                    <span>📍 Westside</span>
                  </div>
                </div>
              </li>
              <li className="trending-item">
                <div className="avatar">TP</div>
                <div className="trending-content">
                  <h4>Potholes causing traffic issues</h4>
                  <div className="trending-meta">
                    <span>🚗 Traffic</span>
                    <span>📍 North District</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Tags */}
          <div className="sidebar-section">
            <h3>🏷️ Popular Tags</h3>
            <div className="tags-container">
              <div className="tag">Infrastructure</div>
              <div className="tag">Waste Management</div>
              <div className="tag">Street Lighting</div>
              <div className="tag">Traffic</div>
              <div className="tag">Parks</div>
              <div className="tag">Water</div>
              <div className="tag">Noise</div>
              <div className="tag">Safety</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default IssueDetail;
