import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Validates the current session and returns the user ID.
 * If no session is found, returns an error response.
 */
export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { 
      userId: null, 
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    };
  }

  // NextAuth v4 usually puts id on session.user if configured in callbacks
  const userId = (session.user as any).id as string; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (!userId) {
    return { 
      userId: null, 
      errorResponse: NextResponse.json({ error: 'User ID missing in session' }, { status: 500 }) 
    };
  }

  return { userId, errorResponse: null };
}
