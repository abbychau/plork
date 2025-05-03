'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { PinnedUser } from './pinned-users-context';
import { fetchPinnedUsers } from './pinned-users-utils';

type User = {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
  summary?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  pinnedUsers: PinnedUser[] | null;
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
};

type RegisterData = {
  username: string;
  displayName?: string;
  email?: string;
  password: string;
  summary?: string;
  profileImage?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pinnedUsers, setPinnedUsers] = useState<PinnedUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Get router instance

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          // Also fetch pinned users if user is logged in
          if (userData) {
            const pinnedUsersData = await fetchPinnedUsers();
            setPinnedUsers(pinnedUsersData);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      // Determine if input is email or username based on @ symbol
      const isEmail = usernameOrEmail.includes('@');

      const loginData = isEmail
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);

      // Also fetch pinned users
      const pinnedUsersData = await fetchPinnedUsers();
      setPinnedUsers(pinnedUsersData);

      // Return both user data and pinned users
      return { user: userData, pinnedUsers: pinnedUsersData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const user = await response.json();

      // Ensure the user state is updated
      setUser(user);

      // Return the user data
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      setPinnedUsers(null); // Clear pinned users on logout
      router.push('/'); // Redirect to homepage
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, pinnedUsers, login, register, logout }}>
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
