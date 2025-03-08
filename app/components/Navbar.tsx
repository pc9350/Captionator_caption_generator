'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiMenu, FiX, FiHome, FiBookmark, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import ProfileImage from './ProfileImage';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add event listener for clicks outside the dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Only add the click outside listener when the dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    {
      name: 'Generator',
      href: '/dashboard/dashboard',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      name: 'Saved Captions',
      href: '/dashboard/saved',
      icon: <FiBookmark className="w-5 h-5" />,
      requireAuth: true,
    },
  ];

  // Only show client-side content after mounting to prevent hydration errors
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image 
                  src="/images/captionator-logo.ico" 
                  alt="Captionator Logo" 
                  width={36} 
                  height={36} 
                  className="mr-2"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">
                  Captionator
                </span>
              </Link>
            </div>
            <div className="flex md:hidden items-center">
              <div className="w-10 h-10"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const filteredLinks = navLinks.filter(
    (link) => !link.requireAuth || (link.requireAuth && user)
  );

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-white/10 dark:bg-gray-900/70 shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/" className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image 
                  src="/images/captionator-logo.ico" 
                  alt="Captionator Logo" 
                  width={40} 
                  height={40} 
                  className="mr-3"
                />
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">
                Captionator
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {filteredLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
              >
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-300 ${
                    pathname === link.href
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20 dark:shadow-purple-500/20'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/50 backdrop-blur-sm hover:shadow-md'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {link.icon}
                  </motion.div>
                  <span>{link.name}</span>
                </Link>
              </motion.div>
            ))}

            <motion.div 
              className="ml-4 flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {user ? (
                <div className="relative avatar-dropdown" ref={dropdownRef}>
                  <motion.button 
                    className="flex items-center space-x-2 focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                  >
                    <ProfileImage
                      photoURL={user.photoURL}
                      displayName={user.displayName}
                      size={40}
                      className="border-2 border-white border-opacity-50 hover:border-opacity-100 transition-all duration-300 shadow-md"
                    />
                  </motion.button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        
                        <Link
                          href="/dashboard/profile"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FiUser className="mr-2" />
                          Profile
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                        >
                          <FiLogOut className="mr-2" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/sign-in"
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-purple-500/30 flex items-center space-x-2 transition-all duration-300"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <motion.button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-gray-800/50 focus:outline-none transition-all duration-300"
              aria-expanded="false"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden backdrop-blur-xl bg-white/20 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {filteredLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-3 transition-all duration-300 ${
                      pathname === link.href
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                </motion.div>
              ))}

              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="flex flex-col space-y-4"
                >
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <ProfileImage
                      photoURL={user.photoURL}
                      displayName={user.displayName}
                      size={40}
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard/profile"
                    className="block w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/50 flex items-center space-x-3 transition-all duration-300"
                    onClick={closeMenu}
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                    className="block w-full px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center space-x-3 transition-all duration-300 shadow-md"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <Link
                    href="/sign-in"
                    className="block px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center space-x-3 mt-4 transition-all duration-300 shadow-md"
                    onClick={closeMenu}
                  >
                    <FiLogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 