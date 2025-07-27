import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  default_address?: string;
  preferences?: any;
  created_at: string;
  updated_at: string;
}

interface CustomerAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: { fullName: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user profile - ENHANCED with better error handling and fallbacks
  const loadUserProfile = useCallback(async (userId: string) => {
    const profileStartTime = Date.now();

    try {
      console.log('🔐 [PROFILE] Loading user profile for:', userId);

      // Increased timeout but with better error handling
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile loading timeout after 5 seconds')), 5000)
      );

      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      const profileTime = Date.now() - profileStartTime;

      if (error) {
        console.log(`🔐 [PROFILE] Profile query completed in ${profileTime}ms with error:`, error.code);

        // Check if it's a missing table error
        if (error.message?.includes('relation "user_profiles" does not exist')) {
          console.warn('🔐 [PROFILE] user_profiles table does not exist - creating fallback profile');
          // Return a basic profile structure as fallback
          return {
            id: userId,
            email: '',
            full_name: '',
            phone: '',
            default_address: '',
            preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }

        // Check if it's a "no rows returned" error (user profile doesn't exist yet)
        if (error.code === 'PGRST116') {
          console.log('🔐 [PROFILE] User profile not found - this is normal for new users');
          return null;
        }

        // Check for connection/timeout errors
        if (error.message?.includes('timeout') || error.message?.includes('network')) {
          console.warn('🔐 [PROFILE] Network/timeout error loading profile - will retry later');
          throw new Error('Network timeout - profile loading failed');
        }

        console.warn('🔐 [PROFILE] Profile loading failed with unknown error:', error);
        return null;
      }

      console.log(`✅ [PROFILE] User profile loaded successfully in ${profileTime}ms`);
      return data;
    } catch (error) {
      const profileTime = Date.now() - profileStartTime;
      console.warn(`🔐 [PROFILE] Profile loading exception after ${profileTime}ms:`, error);

      // For timeout errors, we should throw to let the caller handle it
      if (error.message?.includes('timeout')) {
        throw error;
      }

      return null;
    }
  }, []);

  // Initialize auth state - FIXED loading sequence to prevent race conditions
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 [AUTH-INIT] Starting authentication initialization...');
      const startTime = Date.now();

      try {
        console.log('🔐 [AUTH-INIT] Calling supabase.auth.getSession()...');

        // Get initial session with timeout - but keep loading true until complete
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const { data: { session: initialSession }, error } = await Promise.race([
          sessionPromise,
          sessionTimeout
        ]) as any;

        const sessionTime = Date.now() - startTime;
        console.log(`🔐 [AUTH-INIT] getSession() completed in ${sessionTime}ms`);

        if (error) {
          console.error('🔐 [AUTH-INIT] Error getting session:', error);
          // Set loading to false only after session check is complete
          setLoading(false);
        } else if (initialSession) {
          console.log('🔐 [AUTH-INIT] Initial session found, user:', initialSession.user?.email);
          setSession(initialSession);
          setUser(initialSession.user);

          // Load user profile - wait for it to complete before setting loading to false
          console.log('🔐 [AUTH-INIT] Loading user profile...');
          try {
            const userProfile = await loadUserProfile(initialSession.user.id);
            const profileTime = Date.now() - startTime;
            console.log(`🔐 [AUTH-INIT] Profile loaded in ${profileTime}ms:`, userProfile ? 'SUCCESS' : 'FAILED');
            setProfile(userProfile);
          } catch (error) {
            console.warn('🔐 [AUTH-INIT] Profile loading failed, continuing without profile:', error);
            setProfile(null);
          } finally {
            // Set loading to false only after profile loading is complete
            setLoading(false);
          }
        } else {
          console.log('🔐 [AUTH-INIT] No initial session found');
          // Set loading to false when no session is found
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 [AUTH-INIT] Error initializing auth:', error);
        // Set loading to false on any error to prevent infinite loading
        setLoading(false);
      } finally {
        const totalTime = Date.now() - startTime;
        console.log(`🔐 [AUTH-INIT] Authentication initialization completed in ${totalTime}ms`);
      }
    };

    initializeAuth();

    // Listen for auth changes - FIXED to handle loading states properly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 [AUTH-CHANGE] Event: ${event}, User: ${session?.user?.email || 'none'}`);
      const changeStartTime = Date.now();

      try {
        console.log('🔐 [AUTH-CHANGE] Setting session and user state...');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('🔐 [AUTH-CHANGE] User session found, loading profile...');

          // For auth state changes, we can load profile in background
          // but we should handle errors gracefully
          try {
            const userProfile = await loadUserProfile(session.user.id);
            const profileTime = Date.now() - changeStartTime;
            console.log(`🔐 [AUTH-CHANGE] Profile loaded in ${profileTime}ms:`, userProfile ? 'SUCCESS' : 'FAILED');
            setProfile(userProfile);
          } catch (error) {
            console.warn('🔐 [AUTH-CHANGE] Profile loading failed:', error);
            setProfile(null);
          }
        } else {
          console.log('🔐 [AUTH-CHANGE] No user session, clearing profile');
          setProfile(null);
        }
      } catch (error) {
        console.error('🔐 [AUTH-CHANGE] Error in auth state change:', error);
        // Ensure we don't get stuck in loading state
        setProfile(null);
      } finally {
        const totalTime = Date.now() - changeStartTime;
        console.log(`🔐 [AUTH-CHANGE] Auth state change completed in ${totalTime}ms`);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]); // FIXED: Added loadUserProfile dependency

  // Sign up function
  const signUp = async (email: string, password: string, profileData: { fullName: string; phone?: string; address?: string }) => {
    try {
      setLoading(true);

      console.log('🔐 [SIGNUP] Starting user registration...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.fullName,
            phone: profileData.phone,
            default_address: profileData.address,
          },
        },
      });

      if (error) {
        console.error('🔐 [SIGNUP] Auth signup failed:', error.message);

        // Provide helpful error message for the database trigger issue
        if (error.message.includes('Database error saving new user')) {
          return {
            success: false,
            error: 'Errore del database durante la registrazione. Contatta l\'amministratore per risolvere il problema del trigger del database.'
          };
        }

        return { success: false, error: error.message };
      }

      console.log('🔐 [SIGNUP] Auth user created successfully:', data.user?.id);

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: 'Conferma la tua email',
          description: 'Ti abbiamo inviato un link di conferma. Controlla la tua email.',
        });
      }

      console.log('🔐 [SIGNUP] Registration completed successfully');
      return { success: true };
    } catch (error) {
      console.error('🔐 [SIGNUP] Registration exception:', error);
      return { success: false, error: 'Errore durante la registrazione' };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log(`🔐 [SIGN-IN] Starting sign in for: ${email}`);
    const signInStartTime = Date.now();

    try {
      console.log('🔐 [SIGN-IN] Setting loading to true');
      setLoading(true);

      console.log('🔐 [SIGN-IN] Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const signInTime = Date.now() - signInStartTime;
      console.log(`🔐 [SIGN-IN] signInWithPassword completed in ${signInTime}ms`);

      if (error) {
        console.error('🔐 [SIGN-IN] Sign in error:', error);
        return { success: false, error: error.message };
      }

      console.log('🔐 [SIGN-IN] Sign in successful, user:', data.user?.email);

      toast({
        title: 'Accesso effettuato',
        description: 'Benvenuto!',
      });

      return { success: true };
    } catch (error) {
      console.error('🔐 [SIGN-IN] Sign in exception:', error);
      return { success: false, error: 'Errore durante l\'accesso' };
    } finally {
      const totalTime = Date.now() - signInStartTime;
      console.log(`🔐 [SIGN-IN] Sign in process completed in ${totalTime}ms, setting loading to false`);
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();

      toast({
        title: 'Disconnesso',
        description: 'Sei stato disconnesso con successo.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: 'Utente non autenticato' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Reload profile
      const updatedProfile = await loadUserProfile(user.id);
      setProfile(updatedProfile);

      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state salvate.',
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Errore durante l\'aggiornamento del profilo' };
    }
  };

  const value: CustomerAuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthProvider;
