import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AdminHome from './pages/AdminPages/AdminHome';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Shop from './pages/UserPages/Shop'
import { CardCollection } from './pages/UserPages/CardCollection';
import Profile from './pages/UserPages/Profile';
// GAMES
import MemoryGame from './components/MemoryGame';
import QuizGame from './components/QuizGame';
import WordScramble from './components/WordScramble';
import WhackAVirus from './components/WhackAVirus';
import BuildVaccine from './components/BuildVaccine';
import TriviaBingo from './components/TriviaBingo';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Public Home Route for All Authenticated Users */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cardCollection" element={<CardCollection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/games/memory" element={<MemoryGame />} />
            <Route path="/games/quiz" element={<QuizGame />} />
            <Route path="/games/word-scramble" element={<WordScramble />} />
            <Route path="/games/whack-a-virus" element={<WhackAVirus />} />
            <Route path="/games/build-vaccine" element={<BuildVaccine />} />
            <Route path="/games/trivia-bingo" element={<TriviaBingo />} />
          </Route>

          {/* Admin Route with Role-Based Access */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin-home" element={<AdminHome />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;