import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams(); // Extract the token from the route
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Call the API to verify the email
        const response = await axios.get(`/api/auth/verify-email/${token}`);

        alert('Email verified successfully!');
      } catch (error) {
        console.error('Verification error:', error.response?.data || error.message);
        alert('Email verification failed: ' + (error.response?.data?.error || 'Unknown error'));
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div>
      <h2>Verifying Email...</h2>
    </div>
  );
};

export default VerifyEmail;
