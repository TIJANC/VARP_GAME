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
import Profile from './pages/UserPages/Profile';
import Forum from './pages/UserPages/Forum';
import TradeCenter from './pages/UserPages/TradeCenter';
// GAMES
import Quiz from './components/dinamicQuiz';
import CardGame from './pages/UserPages/CardGame';
import PvEBattle from './pages/UserPages/PvEBattle';
import PvPBattle from './pages/UserPages/PvPBattle';

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/forum" element={<Forum />}/>
            <Route path="/games/dinamic-quiz" element={<Quiz />} />
            <Route path="/games/card-game" element={<CardGame />} />
            <Route path="/games/PvE-battle" element={<PvEBattle />} />
            <Route path="/games/PvP-battle" element={<PvPBattle />} />
            <Route path="/trade-center" element={<TradeCenter />} />
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
