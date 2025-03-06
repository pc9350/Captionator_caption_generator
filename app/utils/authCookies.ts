'use client';

import { User, getIdToken } from 'firebase/auth';
import Cookies from 'js-cookie';

const AUTH_TOKEN_KEY = 'firebase-auth-token';
const TOKEN_EXPIRY_DAYS = 7;

/**
 * Set the authentication token in cookies on the client side
 * This is used for client-side state management only
 * The actual HTTP-only cookie is set by the API
 */
export const setAuthCookie = async (user: User) => {
  try {
    // Get the ID token
    const token = await getIdToken(user);
    
    // Set the token in a client-side cookie (for state management)
    Cookies.set(AUTH_TOKEN_KEY, token, { 
      expires: TOKEN_EXPIRY_DAYS,
      sameSite: 'strict'
    });
    
    // Call the API to set the HTTP-only cookie
    await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    return true;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return false;
  }
};

/**
 * Remove the authentication token from cookies
 */
export const removeAuthCookie = async () => {
  try {
    // Remove the client-side cookie
    Cookies.remove(AUTH_TOKEN_KEY);
    
    // Call the API to remove the HTTP-only cookie
    await fetch('/api/auth/token', {
      method: 'DELETE',
    });
    
    return true;
  } catch (error) {
    console.error('Error removing auth cookie:', error);
    return false;
  }
};

/**
 * Get the authentication token from client-side cookies
 */
export const getAuthCookie = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_KEY);
};

/**
 * Refresh the authentication token in cookies
 */
export const refreshAuthCookie = async (user: User) => {
  return await setAuthCookie(user);
}; 