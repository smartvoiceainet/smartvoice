import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import User, { UserRole } from '@/models/User';
import dbConnect from '@/libs/mongoose';
import mongoose from 'mongoose';

/**
 * Admin API route for granting Voice AI access to a user
 * 
 * POST /api/voice-ai/admin/users/[userId]/access
 * Admin authentication required
 * 
 * Request body:
 * {
 *   "role": "attorney" | "paralegal" | "staff" | "user",
 *   "grant": true | false
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get request body
    const { role, grant } = await req.json();

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role) && role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Find the target user
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Grant or revoke access
    if (grant === true) {
      // Grant access
      user.isVoiceAiEnabled = true;
      user.role = role || UserRole.USER;
      user.voiceAiActivatedAt = new Date();
      user.voiceAiActivatedBy = new mongoose.Types.ObjectId(session.user.id);
      
      // TODO: Send notification to user that their access was granted
    } else if (grant === false) {
      // Revoke access
      user.isVoiceAiEnabled = false;
      
      // If role is provided, update it, otherwise set to PENDING
      user.role = role || UserRole.PENDING;
      
      // TODO: Send notification to user that their access was revoked
    }

    await user.save();

    return NextResponse.json({
      message: grant 
        ? `Voice AI access granted to ${user.email}` 
        : `Voice AI access revoked from ${user.email}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasVoiceAiAccess: user.hasVoiceAiAccess(),
        isVoiceAiEnabled: user.isVoiceAiEnabled,
        voiceAiActivatedAt: user.voiceAiActivatedAt
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error managing Voice AI access:', error);
    return NextResponse.json(
      { error: 'Failed to update Voice AI access' },
      { status: 500 }
    );
  }
}

/**
 * Admin API route for getting a user's Voice AI access details
 * 
 * GET /api/voice-ai/admin/users/[userId]/access
 * Admin authentication required
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the target user
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user's Voice AI access details
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasVoiceAiAccess: user.hasVoiceAiAccess(),
        isVoiceAiEnabled: user.isVoiceAiEnabled,
        voiceAiActivatedAt: user.voiceAiActivatedAt,
        voiceAiActivatedBy: user.voiceAiActivatedBy
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving Voice AI access details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Voice AI access details' },
      { status: 500 }
    );
  }
}
