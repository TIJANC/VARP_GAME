import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(''); // Email for invitation
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    birthplace: '',
    scholarity: '',
    avatar: '',
  });
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Fetch user information and avatar options on load
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
        setFormData({
          gender: response.data.gender || '',
          age: response.data.age || '',
          birthplace: response.data.birthplace || '',
          scholarity: response.data.scholarity || '',
          avatar: response.data.avatar || '',
        });
        setSelectedAvatar(response.data.avatar || '');
      } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Error fetching user information. Please log in again.');
      }
    };

    const fetchAvatarOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/avatar-options', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvatarOptions(response.data.avatars);
      } catch (error) {
        console.error('Error fetching avatar options:', error);
        alert('Error fetching avatar options.');
      }
    };

    fetchUserInfo();
    fetchAvatarOptions();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({ ...prev, avatar }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/player/update-profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserInfo(response.data);
      setIsModalOpen(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  // Handle invitation submission
  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address to invite.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/player/invite',
        { email: inviteEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Invitation sent successfully!');
      setInviteEmail(''); // Reset the input field
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  return (
    <div>
      <h1>Profile Page</h1>

      {/* Display User Avatar */}
      <div className="avatar-container">
        <img
          src={userInfo.avatar || 'default-avatar.png'}
          alt="User Avatar"
          className="avatar"
        />
      </div>

      {/* User Information List */}
      <ul>
        <li><strong>Username:</strong> {userInfo.username || 'Not provided'}</li>
        <li><strong>Email:</strong> {userInfo.email || 'Not provided'}</li>
        <li><strong>Gender:</strong> {userInfo.gender || 'Not provided'}</li>
        <li><strong>Age:</strong> {userInfo.age || 'Not provided'}</li>
        <li><strong>Birthplace:</strong> {userInfo.birthplace || 'Not provided'}</li>
        <li><strong>Scholarity:</strong> {userInfo.scholarity || 'Not provided'}</li>
      </ul>

      {/* Edit Profile Button */}
      <button onClick={() => setIsModalOpen(true)}>Edit Profile</button>

      {/* Invite a Friend */}
      <div className="invite-section">
        <h3>Invite a Friend</h3>
        <input
          type="email"
          placeholder="Enter friend's email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <button onClick={handleInvite}>Send Invitation</button>
      </div>

      {/* Modal for Updating Profile */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Your Profile</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Gender:</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Birthplace:</label>
                <input
                  type="text"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Scholarity:</label>
                <input
                  type="text"
                  name="scholarity"
                  value={formData.scholarity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Select Avatar:</label>
                <div className="avatar-options">
                  {avatarOptions.map((avatar) => (
                    <img
                      key={avatar}
                      src={avatar}
                      alt="Avatar Option"
                      className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(avatar)}
                    />
                  ))}
                </div>
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
