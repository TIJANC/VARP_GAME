import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      alert('Password reset link sent to your email');
    } catch (error) {
      alert('Error: ' + error.response.data.error);
    }
  };

  return (
      <div className="forgot-container">
       <header>
        <img
          src="/Images/VARP_logo.png"
          alt="Vaccine Awareness Logo"
          className="logo"
        />
      </header>
      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
