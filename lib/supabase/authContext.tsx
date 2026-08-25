'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, signInWithGoogle, signOutUser, isSupabaseConfigured } from './client';
import { UserProfile, UserRole, ROLE_PERMISSIONS } from '@/core/auth/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const defaultProfile: UserProfile = {
  id: 'usr_admin_001',
  name: 'Divyanshu Sinha',
  email: 'divyanshu@merchantpulse.io',
  role: 'OWNER',
  merchantId: 'rzp_merchant_main',
  permissions: ROLE_PERMISSIONS.OWNER,
  avatarUrl: undefined,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: defaultProfile,
  loading: true,
  isConfigured: false,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  switchRole: () => {},
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState<boolean>(false);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        updateProfileFromUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        updateProfileFromUser(session.user);
      } else {
        setProfile(defaultProfile);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfileFromUser = (u: User) => {
    const userMetadata = u.user_metadata || {};
    const appMetadata = u.app_metadata || {};
    const role: UserRole = (appMetadata.role as UserRole) || 'OWNER';

    setProfile({
      id: u.id,
      name: userMetadata.full_name || userMetadata.name || u.email?.split('@')[0] || 'Merchant Admin',
      email: u.email || 'merchant@example.com',
      role,
      merchantId: (appMetadata.merchant_id as string) || 'rzp_merchant_main',
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.OWNER,
      avatarUrl: userMetadata.avatar_url || userMetadata.picture || undefined,
    });
  };

  const handleSignInWithGoogle = async (redirectTo?: string) => {
    try {
      await signInWithGoogle(redirectTo);
    } catch (err) {
      console.error('Google Auth Failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setSession(null);
      setIsDemoLoggedIn(false);
      setProfile(defaultProfile);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setIsDemoLoggedIn(true);
    setProfile(prev => ({
      ...prev,
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole],
    }));
  };

  const isAuthenticated = !!user || isDemoLoggedIn;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        isAuthenticated,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        switchRole,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
