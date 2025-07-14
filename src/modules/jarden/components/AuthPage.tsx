
import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // For signup
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!EMAIL_REGEX.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!fullName.trim()) {
        setError("Full name is required for signup.");
        return;
      }
    }
     if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        // With email confirmation disabled in Supabase, user is auto-logged in.
        // onAuthStateChange handles the session update.
        // No explicit alert needed here as onLoginSuccess will navigate away.
        onLoginSuccess(); 
      } else {
        await signInWithEmail(email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // onLoginSuccess will be called by onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputBaseClass = "w-full px-4 py-3 border border-[#B6B6B6] rounded-lg shadow-sm focus:outline-none sm:text-sm bg-white text-[#2C2C2C] placeholder-[#A67C52]";
  const inputFocusClass = "focus:ring-2 focus:ring-[#6C8C61] focus:border-[#6C8C61]";


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{backgroundColor: '#fdfcf9', backgroundImage: 'url("https://www.transparenttextures.com/patterns/exclusive-paper.png")'}}>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-[#E5E3DD] shadow-2xl rounded-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6C8C61]">Welcome to Jarden</h1>
          <p className="text-[#A67C52] mt-2">{isSignUp ? 'Create your account to get started.' : 'Sign in to access your garden.'}</p>
        </div>

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#2C2C2C] sr-only">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className={`${inputBaseClass} ${inputFocusClass}`}
                required={isSignUp}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C] sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className={`${inputBaseClass} ${inputFocusClass}`}
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2C2C] sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 6 characters)"
              className={`${inputBaseClass} ${inputFocusClass} pr-10`}
              required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-[#A67C52] hover:text-[#2C2C2C]"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#6C8C61] hover:bg-[#5a7850] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C8C61] disabled:opacity-70 transition-all duration-300 ease-in-out"
          >
            {isLoading || authLoading ? <LoadingSpinner size="sm" color="text-white" /> : (isSignUp ? 'Sign Up & Continue' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#B6B6B6]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#fdfcf9] text-[#A67C52]">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || authLoading}
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-[#B6B6B6] rounded-lg shadow-sm bg-white text-sm font-medium text-[#2C2C2C] hover:bg-[#FDFCF9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C8C61] disabled:opacity-70 transition-all duration-300 ease-in-out"
          >
             <svg className="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-[#A67C52]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-medium text-[#6C8C61] hover:text-[#5a7850]">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
