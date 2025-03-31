import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    <div className="relative min-h-screen bg-[#0B0C10] p-4 overflow-y-auto">
      {/* Background Overlays */}
      <div className="absolute inset-0 bg-[url('/BG/bg3.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent bg-opacity-50 p-6 sm:p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">
          Forum
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Create Post Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#66FCF1] mb-2">
            Create a New Post
          </h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) =>
              setNewPost({ ...newPost, title: e.target.value })
            }
            className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-200 placeholder-gray-400"
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-200 placeholder-gray-400"
          ></textarea>
          <button
            onClick={handleCreatePost}
            className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
          >
            Post
          </button>
        </div>

        {/* Display Posts */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className="p-4 bg-gray-800 bg-opacity-80 rounded shadow-md"
              >
                <h3 className="text-xl font-bold text-[#66FCF1]">
                  {post.title}
                </h3>
                <p className="text-gray-200 mt-2">{post.content}</p>
                <p className="text-gray-400 mt-2">
                  <strong>By:</strong> {post.user?.username || 'Anonymous'}
                </p>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-[#66FCF1]">
                    Comments
                  </h4>
                  <div className="space-y-1 mt-2">
                    {post.comments.map((c, index) => (
                      <p key={index} className="text-gray-300 text-sm">
                        {c.comment}
                      </p>
                    ))}
                  </div>
                  <div className="mt-2 flex">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-grow p-2 rounded-l bg-gray-800 text-gray-200 placeholder-gray-400"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="px-4 py-2 bg-[#45A29E] text-white rounded-r hover:bg-[#66FCF1] transition"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-300">No posts found.</p>
          )}
        </div>
      </div>

      <ActionNavbar />
    </div>
  );
};

export default Forum;
