'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuthCookie } from '../utils/authCookies';
import { useSearchParams } from 'next/navigation';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard/dashboard';

  // Set initial mode based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/sign-up') {
      setIsSignIn(false);
    } else {
      setIsSignIn(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password, redirect);
      if (user) {
        await setAuthCookie(user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(
        error.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : 'An error occurred during sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name, redirect);
      if (user) {
        await setAuthCookie(user);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please sign in instead.');
      } else if (error.code === 'auth/configuration-not-found') {
        setError('Firebase authentication configuration not found. Please check your Firebase setup.');
      } else {
        setError(`Error: ${error.message || 'An error occurred during sign up. Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle(redirect);
      if (user) {
        await setAuthCookie(user);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError('An error occurred during Google sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Animation variants for the panels
  const leftPanelVariants = {
    signIn: { x: "0%" },
    signUp: { x: "100%" }
  };

  const rightPanelVariants = {
    signIn: { x: "0%" },
    signUp: { x: "-100%" }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left panel - Changes position based on auth mode */}
      <motion.div 
        className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 flex-col justify-center items-center relative overflow-hidden"
        variants={leftPanelVariants}
        initial={isSignIn ? "signIn" : "signUp"}
        animate={isSignIn ? "signIn" : "signUp"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 bg-black opacity-10 z-0"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/80 to-purple-700/80"></div>
          <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-10"></div>
        </div>
        
        <motion.div 
          className="z-10 max-w-md text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-6">
              {isSignIn ? "Welcome Back!" : "Join Us Today!"}
            </h2>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <p className="text-xl mb-8 text-white/90">
              {isSignIn 
                ? "Sign in to continue your journey with amazing Instagram captions." 
                : "Create an account to start generating perfect captions for your Instagram posts."}
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mb-8">
            <Image 
              src="/images/login-page-image.jpg" 
              alt="Instagram caption generator" 
              width={400} 
              height={300} 
              className="rounded-xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </motion.div>
          
          <motion.button
            variants={itemVariants}
            onClick={() => setIsSignIn(!isSignIn)}
            className="px-8 py-3 bg-white text-indigo-700 rounded-full font-medium hover:bg-white/90 transition-colors shadow-lg"
          >
            {isSignIn ? "Create an account" : "Sign in instead"}
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Mobile view - Only visible on mobile */}
      <div className="md:hidden flex flex-col w-full">
        {/* Mobile header with proper spacing for navbar */}
        <div className="pt-24 w-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-6 pb-8 flex flex-col items-center relative">
          <div className="absolute inset-0 bg-black opacity-10 z-0"></div>
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/80 to-purple-700/80"></div>
            <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-10"></div>
          </div>
          
          <div className="z-10 text-center">
            <h2 className="text-3xl font-bold mb-2">
              {isSignIn ? "Welcome Back!" : "Join Us Today!"}
            </h2>
            <p className="text-base text-white/90 max-w-xs mx-auto">
              {isSignIn 
                ? "Sign in to continue your journey with amazing captions" 
                : "Create an account to start generating perfect captions"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right panel - Form container */}
      <motion.div 
        className="w-full md:w-1/2 bg-white dark:bg-gray-900 p-6 md:p-8 flex items-center justify-center md:pt-8 pt-10"
        variants={rightPanelVariants}
        initial={isSignIn ? "signIn" : "signUp"}
        animate={isSignIn ? "signIn" : "signUp"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isSignIn ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="md:block hidden">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to your account
                  </h2>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md flex items-center">
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleSignIn}>
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        href="/reset-password"
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 md:mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span className="ml-2">Sign in with Google</span>
                    </button>
                  </div>
                </div>
                
                {/* Mobile toggle - Only visible on mobile */}
                <div className="md:hidden text-center mt-6">
                  <button
                    onClick={() => setIsSignIn(false)}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="md:block hidden">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create your account
                  </h2>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md flex items-center">
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form className="space-y-4 md:space-y-6" onSubmit={handleSignUp}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email-address-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email-address-signup"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password-signup"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 md:mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span className="ml-2">Sign up with Google</span>
                    </button>
                  </div>
                </div>
                
                {/* Mobile toggle - Only visible on mobile */}
                <div className="md:hidden text-center mt-6">
                  <button
                    onClick={() => setIsSignIn(true)}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}