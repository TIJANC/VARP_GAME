import React, { useState, useEffect } from 'react';
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
    avatar: '',
  });

  const [avatarOptions, setAvatarOptions] = useState([
    '/sprites/WandererMagican/Run.png',
    '/sprites/Knight_1/Attack1.png',
    '/sprites/Ninja_Peasant/Disguise.png',
  ]);
  const [selectedAvatar, setSelectedAvatar] = useState('');

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
          avatar: response.data.avatar || '', // Set avatar in formData
        });
  
        setSelectedAvatar(response.data.avatar || ''); // Set avatar in selectedAvatar
      } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Error fetching user information. Please log in again.');
      }
    };
  
    fetchUserInfo();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({
      ...prev,
      avatar, // Update avatar in the formData
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedFormData = {
        ...formData,
        avatar: selectedAvatar, // Send the selected avatar
      };
      const response = await axios.post('/api/player/update-profile', updatedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setUserInfo(response.data); // Update userInfo with response data
      setFormData(response.data); // Sync formData with updated user info
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
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  return (
    <div className="profile-container">
      <header>
        <img
          src="/Images/VARP_logo.png"
          alt="Vaccine Awareness Logo"
          className="logo"
        />
      </header>

      <div className="avatar-container">
      <img
     style={{
      backgroundImage: `url(${userInfo.avatar || ''})`
    }}
    className={`immagine ${
      userInfo.avatar?.endsWith('Run.png') ? 'sprite-run' :
      userInfo.avatar?.endsWith('Attack1.png') ? 'sprite-attack' :
      'sprite-disguise'
    }`}
      />
</div>

      <ul>
        <li>
          <strong>Username:</strong> {userInfo.username || 'Not provided'}
        </li>
        <li>
          <strong>Email:</strong> {userInfo.email || 'Not provided'}
        </li>
        <li>
          <strong>Gender:</strong> {userInfo.gender || 'Not provided'}
        </li>
        <li>
          <strong>Age:</strong> {userInfo.age || 'Not provided'}
        </li>
        <li>
          <strong>Birthplace:</strong> {userInfo.birthplace || 'Not provided'}
        </li>
        <li>
          <strong>Scholarity:</strong> {userInfo.scholarity || 'Not provided'}
        </li>
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

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Your Profile</h2>
            <form onSubmit={handleSubmit}>
              <div>
              <strong><label>Gender: </label></strong>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <strong><label>Age: </label></strong>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                />
              </div>
              <div>
              <strong><label>Birthplace: </label></strong>
                <input
                  type="text"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleInputChange}
                />
              </div>
              <div>
              <strong><label>Scholarity: </label></strong>
                <input
                  type="text"
                  name="scholarity"
                  value={formData.scholarity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
              <strong><label>Select Avatar: </label></strong>
                <div className="avatar-options">
                  {avatarOptions.map((avatar, index) => {
                    const spriteClass =
                      index === 0 ? "sprite-run" :
                      index === 1 ? "sprite-attack" :
                      index === 2 ? "sprite-disguise" : "";

                    return (
                      <div
                        key={index}
                        className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <div
                          className={`avatar-sprite ${spriteClass}`}
                          style={{
                            backgroundImage: `url(${avatar})`,
                          }}
                        ></div>
                      </div>
                    );
                  })}
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
      <ActionNavbar
      />
      </div>
  );
};

export default Profile;
