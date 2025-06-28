import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('loggedIn') === 'true';
  });

  const login = (username, password) => {
    const user = import.meta.env.VITE_LOGIN_USER;
    const pass = import.meta.env.VITE_LOGIN_PASS;
    if (username === user && password === pass) {
      setAuthed(true);
      localStorage.setItem('loggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthed(false);
    localStorage.removeItem('loggedIn');
  };

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
