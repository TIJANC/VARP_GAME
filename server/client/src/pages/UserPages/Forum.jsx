import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Forum.css';
import ActionNavbar from '../../components/ActionNavbar';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Added state for search
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post('/api/forum/create-post', newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
      setNewPost({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post(
        `/api/forum/posts/${postId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Filter posts based on search term (case-insensitive)
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="forum-container">
        <h1>Forum</h1>

        {/* 🔍 Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Create Post Section */}
        <div className="create-post">
          <h2>Create a New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <button onClick={handleCreatePost}>Post</button>
        </div>

        {/* Display Filtered Posts */}
        <div className="posts">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post._id} className="post">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <p><strong>By:</strong> {post.user?.username || 'Anonymous'}</p>
                <div className="comments">
                  <h4>Comments</h4>
                  {post.comments.map((comment, index) => (
                    <p key={index}>{comment.comment}</p>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button onClick={() => handleAddComment(post._id)}>Comment</button>
                </div>
              </div>
            ))
          ) : (
            <p>No posts found.</p>
          )}
        </div>
      </div>
      <ActionNavbar />
    </div>
  );
};

export default Forum;
