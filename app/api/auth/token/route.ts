import { NextRequest, NextResponse } from 'next/server';

const TOKEN_NAME = 'firebase-auth-token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Create response with cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_EXPIRY,
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error) {
    console.error('Error setting token cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set token' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Create response and delete cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete(TOKEN_NAME);
    
    return response;
  } catch (error) {
    console.error('Error removing token cookie:', error);
    return NextResponse.json(
      { error: 'Failed to remove token' },
      { status: 500 }
    );
  }
} 