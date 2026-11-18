import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AccountLookupResult {
  success: boolean;
  identifier: string;
  fullName: string;
  maskedEmail: string;
  requiresPassword: boolean;
  requiresMfa: boolean;
}

interface LoginResult {
  success?: boolean;
  requiresMfa?: boolean;
  message?: string;
  user?: User;
  token?: string;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  lookupResult: AccountLookupResult | null;
  lookupError: string | null;
  loginError: string | null;
  isAuthenticating: boolean;
  lookupAccount: (identifier: string) => Promise<boolean>;
  login: (password: string, mfaOtp?: string) => Promise<LoginResult>;
  resetLookup: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Session token in memory / sessionStorage fallback
    return sessionStorage.getItem('9hr_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lookupResult, setLookupResult] = useState<AccountLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Verify existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const storedToken = sessionStorage.getItem('9hr_auth_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            if (storedToken) setToken(storedToken);
          }
        } else {
          sessionStorage.removeItem('9hr_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verification network error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const resetLookup = () => {
    setLookupResult(null);
    setLookupError(null);
    setLoginError(null);
  };

  /**
   * Step 1: Look up account on real backend
   */
  const lookupAccount = async (identifier: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setLookupError(null);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || 'Failed to verify account identifier.');
        setLookupResult(null);
        return false;
      }

      setLookupResult(data);
      return true;
    } catch (err) {
      setLookupError('Network connection error. Unable to connect to 9HR authentication gateway.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Step 2: Authenticate with password and optional MFA
   */
  const login = async (password: string, mfaOtp?: string): Promise<LoginResult> => {
    if (!lookupResult) {
      return { error: 'Please enter your Employee ID or Candidate ID first.' };
    }

    setIsAuthenticating(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: lookupResult.identifier,
          password,
          mfaOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed. Please try again.');
        return { error: data.error };
      }

      // Check if MFA is required in a 2nd step
      if (data.requiresMfa && !data.token) {
        return { requiresMfa: true, message: data.message };
      }

      // Successful login
      if (data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        sessionStorage.setItem('9hr_auth_token', data.token);
        setLookupResult(null);
        return { success: true, user: data.user, token: data.token };
      }

      return { error: 'Invalid response from authentication server.' };
    } catch (err) {
      const errMsg = 'Failed to communicate with 9HR authentication server.';
      setLoginError(errMsg);
      return { error: errMsg };
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Log out session
   */
  const logout = async () => {
    try {
      const currentToken = token || sessionStorage.getItem('9hr_auth_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem('9hr_auth_token');
      setToken(null);
      setUser(null);
      resetLookup();
    }
  };

  const refreshUser = async () => {
    const currentToken = token || sessionStorage.getItem('9hr_auth_token');
    if (!currentToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        lookupResult,
        lookupError,
        loginError,
        isAuthenticating,
        lookupAccount,
        login,
        resetLookup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
