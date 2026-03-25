import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('boutique_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('boutique_token') || null);
  const [role, setRole] = useState(localStorage.getItem('boutique_role') || null);

  const login = (userData, accessToken, userRole) => {
    setUser(userData);
    setToken(accessToken);
    setRole(userRole);
    localStorage.setItem('boutique_token', accessToken);
    localStorage.setItem('boutique_role', userRole);
    if (userData) {
      localStorage.setItem('boutique_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('boutique_user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('boutique_user');
    localStorage.removeItem('boutique_token');
    localStorage.removeItem('boutique_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      isAdmin: role === 'admin',
      isLoggedIn: !!token,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
