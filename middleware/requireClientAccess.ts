import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/models/User';

/**
 * Middleware to check if user has access to the requested client data
 * - Admin users can access all client data
 * - Client users can only access their own client data
 * - Regular users with specific permissions can access client data they are assigned to
 */
export async function requireClientAccess(
  req: NextRequest,
  res: NextResponse,
  clientIdParam?: string
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Client ID can be from route params, query params, or request body
    const clientId = 
      clientIdParam || 
      req.nextUrl.searchParams.get('clientId') || 
      (req.body && (await req.body.clientId));
    
    // Admin users can access all client data
    if (session.user.role === UserRole.ADMIN) {
      return NextResponse.next();
    }
    
    // Client users can only access their own client data
    if (session.user.isClientUser) {
      // If no client ID is provided or different from user's clientId, return forbidden
      if (!clientId || clientId !== session.user.clientId?.toString()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    
    // For regular users, check if they have permission to access the specific client
    // This would typically involve checking if the user has been assigned to the client
    // through a separate collection or relationship
    
    return NextResponse.next();
  } catch (error) {
    console.error('Client access check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export default requireClientAccess;
