import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored access token
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (accessToken && userData) {
        // Verify token is still valid by making a test API call
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (redirectTo?: string) => {
    // Store redirect URL for after login
    if (redirectTo) {
      localStorage.setItem('auth_redirect', redirectTo);
    }
    
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_redirect');
    
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
