// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { adminCheckSessionAPI } from '@/API/adminAPI/adminAuthAPI';
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoader, setActionLoader] = useState(false);


  const checkSession = async () => {
    try {
      const response = await adminCheckSessionAPI();
      // console.log("response=", response);
      if (response.status === 200) {
        setUser(response.data.user);
        setIsAuthenticated(response.data.isAuthenticated);
        setLoading(false);
      }
    } catch (error) {
      // console.log('Session validation failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, admin, isAuthenticated, setIsAuthenticated, setUser, setAdmin, loading, setLoading, actionLoader, setActionLoader }}
    >
      {children}
    </AuthContext.Provider>
  );
};
