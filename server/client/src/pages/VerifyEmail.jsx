import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`/api/auth/verify-email/${token}`);
        alert('Email verified successfully!');
        // Redirect to login page
      } catch (error) {
        alert('Email verification failed: ' + error.response.data.error);
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div>
      <h2>Verifying Email...</h2>
    </div>
  );
};

export default VerifyEmail;
