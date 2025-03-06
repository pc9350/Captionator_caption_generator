import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

const TOKEN_NAME = 'firebase-auth-token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Set the authentication token in cookies
 * Note: This function must be called from a Server Component or Route Handler
 */
export const setTokenCookie = (token: string) => {
  const cookieStore = cookies();
  cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_EXPIRY,
    path: '/',
    sameSite: 'strict',
  });
};

/**
 * Remove the authentication token from cookies
 * Note: This function must be called from a Server Component or Route Handler
 */
export const removeTokenCookie = () => {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
};

/**
 * Get the token from cookies
 */
export const getTokenFromCookies = (cookies: ReadonlyRequestCookies) => {
  return cookies.get(TOKEN_NAME)?.value;
};

/**
 * Get the token from server-side cookies
 * Note: This function must be called from a Server Component or Route Handler
 */
export const getTokenFromServerCookies = () => {
  const cookieStore = cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}; 