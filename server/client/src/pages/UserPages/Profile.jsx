import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import './Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    birthplace: '',
    scholarity: '',
    avatar: '', // This will now store the character class, e.g. "knight"
  });

  // Avatar options now store a character class and a preview image.
  const avatarOptions = [
    {
      class: "knight",
      preview: '/Characters/knight1.png',
      description: "Knight: A valiant warrior combining chivalry with modern technology.",
    },
    {
      class: "archer",
      preview: '/Characters/archer1.png',
      description: "Archer: A master marksman with enhanced precision and agility.",
    },
    {
      class: "rogue",
      preview: '/Characters/rogue1.png',
      description: "Rogue: A stealthy infiltrator skilled in unconventional tactics.",
    },
    {
      class: "engineer",
      preview: '/Characters/engineer1.png',
      description: "Engineer: A brilliant inventor who builds advanced contraptions.",
    },
    {
      class: "wizard",
      preview: '/Characters/wizard1.png',
      description: "Wizard: A mystic who blends ancient magic with scientific insight.",
    },
  ];

  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/profile', {
          headers: { Authorization: `Bearer ${token}` },
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

    fetchUserInfo();
  }, []);

  // Helper function to determine which image to display.
  // For example, for a knight, if the user has low EXP (or level "noob" or "amateur"), show knight1.
  // If the user is higher level, show knight2.
  const getProfileCharacterImage = () => {
    if (userInfo.avatar === 'knight') {
      // Example: if currentLevel is "noob" or "amateur", use knight1, else knight2.
      if (userInfo.currentLevel === 'noob' || userInfo.currentLevel === 'amateur') {
        return '/Characters/knight1.png';
      } else {
        return '/Characters/knight2.png';
      }
    } else if (userInfo.avatar === 'archer') {
      if (userInfo.currentLevel === 'noob' || userInfo.currentLevel === 'amateur') {
        return '/Characters/archer1.png';
      } else {
        return '/Characters/archer2.png';
      }
    } else if (userInfo.avatar === 'rogue') {
      if (userInfo.currentLevel === 'noob' || userInfo.currentLevel === 'amateur') {
        return '/Characters/rogue1.png';
      } else {
        return '/Characters/rogue2.png';
      }
    } else if (userInfo.avatar === 'engineer') {
      if (userInfo.currentLevel === 'noob' || userInfo.currentLevel === 'amateur') {
        return '/Characters/engineer1.png';
      } else {
        return '/Characters/engineer2.png';
      }
    } else if (userInfo.avatar === 'wizard') {
      if (userInfo.currentLevel === 'noob' || userInfo.currentLevel === 'amateur') {
        return '/Characters/wizard1.png';
      } else {
        return '/Characters/wizard2.png';
      }
    }
    // Fallback image
    return '/Images/default-avatar.png';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // When selecting an avatar, we now store the character class.
  const handleAvatarSelect = (option) => {
    setSelectedAvatar(option.class);
    setFormData(prev => ({ ...prev, avatar: option.class }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedFormData = {
        ...formData,
        avatar: selectedAvatar,
      };
      const response = await axios.post('/api/player/update-profile', updatedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(response.data);
      setFormData(response.data);
      setIsModalOpen(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert('Please enter an email address to invite.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/player/invite', { email: inviteEmail }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Invitation sent successfully!');
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  return (
    <div className="profile-page-container">
      <header>
        <img src="/Images/VARP_logo.png" alt="Vaccine Awareness Logo" className="logo" />
      </header>

      <div className="profile-content">
        {/* Use the helper to render the appropriate avatar image */}
        <div className="avatar-container">
          <img
            src={getProfileCharacterImage()}
            alt="User Avatar"
            className="avatar"
          />
        </div>

        <ul className="profile-info">
          <li><strong>Username:</strong> {userInfo.username || 'Not provided'}</li>
          <li><strong>Email:</strong> {userInfo.email || 'Not provided'}</li>
          <li><strong>Gender:</strong> {userInfo.gender || 'Not provided'}</li>
          <li><strong>Age:</strong> {userInfo.age || 'Not provided'}</li>
          <li><strong>Birthplace:</strong> {userInfo.birthplace || 'Not provided'}</li>
          <li><strong>Scholarity:</strong> {userInfo.scholarity || 'Not provided'}</li>
        </ul>

        <div className="edit-section">
          <button onClick={() => setIsModalOpen(true)}>Edit Profile</button>
        </div>

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
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Your Profile</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <strong><label>Gender: </label></strong>
                <input type="text" name="gender" value={formData.gender} onChange={handleInputChange} />
              </div>
              <div>
                <strong><label>Age: </label></strong>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} />
              </div>
              <div>
                <strong><label>Birthplace: </label></strong>
                <input type="text" name="birthplace" value={formData.birthplace} onChange={handleInputChange} />
              </div>
              <div>
                <strong><label>Scholarity: </label></strong>
                <input type="text" name="scholarity" value={formData.scholarity} onChange={handleInputChange} />
              </div>
              <div>
                <strong><label>Select Character: </label></strong>
                <div className="avatar-options">
                  {avatarOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`avatar-option ${selectedAvatar === option.class ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(option)}
                    >
                      <img
                        src={option.preview}
                        alt={option.description}
                        className="character-image"
                      />
                      <p className="character-description">{option.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <ActionNavbar />
    </div>
  );
};

export default Profile;
