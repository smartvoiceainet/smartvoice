import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import User, { UserRole } from '@/models/User';
import dbConnect from '@/libs/mongoose';

/**
 * Admin API route for listing all users
 * 
 * GET /api/voice-ai/admin/users
 * Admin authentication required
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Admin permission required' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get all users
    const users = await User.find({}).sort({ createdAt: -1 }).select('-__v');

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasVoiceAiAccess: user.hasVoiceAiAccess?.(),
        isVoiceAiEnabled: user.isVoiceAiEnabled,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    );
  }
}
