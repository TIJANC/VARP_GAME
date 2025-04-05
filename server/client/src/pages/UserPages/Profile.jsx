import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    birthplace: '',
    scholarity: '',
    avatar: '', // stores the character class, e.g. "knight"
  });

  // Avatar options with a character class, preview image, and description.
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

  // Helper function to determine which profile character image to display.
  const getProfileCharacterImage = () => {
    if (!userInfo.avatar) return '/Images/default-avatar.png';
    
    const level = userInfo.currentLevel.toLowerCase();
    if (level === 'noob' || level === 'amateur') {
      return `/Characters/${userInfo.avatar}1.png`;
    } else if (level === 'senior') {
      return `/Characters/${userInfo.avatar}2.png`;
    } else if (level === 'veteran') {
      return `/Characters/${userInfo.avatar}3.png`;
    } else if (level === 'master') {
      return `/Characters/${userInfo.avatar}4.png`;
    }
    return '/Images/default-avatar.png';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // When selecting an avatar, store the character class.
  const handleAvatarSelect = (option) => {
    setSelectedAvatar(option.class);
    setFormData(prev => ({ ...prev, avatar: option.class }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedFormData = { ...formData, avatar: selectedAvatar };
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
    <div className="profile-page-container relative bg-[#0B0C10] min-h-screen p-4 overflow-y-auto">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      <div className="relative z-10 max-w-4xl mx-auto bg-transparent bg-opacity-50 shadow-lg p-6 sm:p-8 rounded-lg">
        <div className="flex flex-col items-center">
          {/* Avatar Section */}
          <div className="w-32 h-32 mb-4">
            <img src={getProfileCharacterImage()} alt="User Avatar" className="w-full h-full object-contain" />
          </div>

          {/* Profile Info */}
          <ul className="w-full text-gray-300 mb-4 space-y-2 text-sm sm:text-base column items-center justify-items-center">
            <li><strong> {userInfo.username || 'Not provided'}</strong></li>
            <li><strong> {userInfo.email || 'Not provided'}</strong></li>
            <li><strong> {userInfo.gender || 'Not provided'}</strong></li>
            <li><strong> {userInfo.age || 'Not provided'}</strong></li>
            <li><strong> {userInfo.birthplace || 'Not provided'}</strong></li>
            <li><strong> {userInfo.scholarity || 'Not provided'}</strong></li>
          </ul>

          {/* Edit and Invite Sections */}
          <div className="mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
            >
              Edit Profile
            </button>
          </div>
          <div className="w-full mb-4">
            <h3 className="text-center text-[#66FCF1] text-lg mb-2">Invite a Friend</h3>
            <div className="flex justify-center">
              <input
                type="email"
                placeholder="Enter friend's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="p-2 rounded-l border-none outline-none bg-gray-200 text-[#0B0C10] w-ful max-w-xs"
              />
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-[#45A29E] text-white rounded-r hover:bg-[#66FCF1] transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
  <div
    className="fixed inset-0 z-50 bg-transparent backdrop-blur-lg flex justify-center items-center p-4"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="bg-[#0B0C10] bg-opacity-90 p-4 rounded-lg w-full max-w-xs max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-center text-[#66FCF1] text-xl mb-4">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-gray-300 mb-1 font-semibold">
            Gender:
          </label>
          <input
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-200 text-[#0B0C10]"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1 font-semibold">
            Age:
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-200 text-[#0B0C10]"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1 font-semibold">
            Birthplace:
          </label>
          <input
            type="text"
            name="birthplace"
            value={formData.birthplace}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-200 text-[#0B0C10]"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1 font-semibold">
            Scholarity:
          </label>
          <input
            type="text"
            name="scholarity"
            value={formData.scholarity}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-200 text-[#0B0C10]"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1 font-semibold">
            Select Character:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {avatarOptions.map((option, index) => (
              <div
                key={index}
                className={`p-2 border rounded cursor-pointer ${
                  selectedAvatar === option.class
                    ? 'border-[#45A29E]'
                    : 'border-transparent'
                }`}
                onClick={() => handleAvatarSelect(option)}
              >
                <img
                  src={option.preview}
                  alt={option.description}
                  className="w-full h-30 object-cover mb-1"
                />
                <p className="text-xs text-gray-300">{option.class}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-around mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-[#66FCF1] text-[#0B0C10] rounded hover:bg-[#45A29E] transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <ActionNavbar />
    </div>
  );
};

export default Profile;
