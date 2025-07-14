import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    handleDiscordCallback();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, verify the token with your API
        // For demo purposes, we'll decode a simple token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp > Date.now() / 1000) {
            setUser(payload.user);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Handle Discord OAuth callback
  const handleDiscordCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Verify the token and get user info
      checkAuthStatus();
    } else if (error) {
      console.error('Discord OAuth error:', error);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // For demo purposes, create a mock token
      const mockUser = {
        id: 1,
        username: 'DemoUser',
        email: email,
        role: 'Director' // Change this to test different roles: 'Staff', 'KCSO', 'KCSO_Command', etc.
      };

      const mockToken = btoa(JSON.stringify({
        user: mockUser,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }));

      localStorage.setItem('token', `header.${mockToken}.signature`);
      setUser(mockUser);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const loginWithDiscord = () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
    window.location.href = `${API_BASE_URL}/auth/discord`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    loginWithDiscord,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};