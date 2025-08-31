import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import User, { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import dbConnect from '@/libs/mongoose';

/**
 * API route for requesting Voice AI access
 * 
 * POST /api/voice-ai/request-access
 * User must be authenticated to request access
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has Voice AI access
    if (user.hasVoiceAiAccess()) {
      return NextResponse.json(
        { message: 'You already have Voice AI access' },
        { status: 200 }
      );
    }

    // Update user role to pending if not already
    if (user.role !== UserRole.PENDING) {
      user.role = UserRole.PENDING;
      await user.save();
    }

    // TODO: Send notification to admins about new access request
    // This could be implemented via email, in-app notification, etc.

    return NextResponse.json({
      message: 'Voice AI access request submitted. An administrator will review your request.',
      status: 'pending'
    }, { status: 200 });
  } catch (error) {
    console.error('Error requesting Voice AI access:', error);
    return NextResponse.json(
      { error: 'Failed to submit access request' },
      { status: 500 }
    );
  }
}

/**
 * API route for checking Voice AI access status
 * 
 * GET /api/voice-ai/request-access
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

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return the user's Voice AI access status
    return NextResponse.json({
      hasAccess: user.hasVoiceAiAccess(),
      role: user.role,
      isVoiceAiEnabled: user.isVoiceAiEnabled,
      status: user.role === UserRole.PENDING ? 'pending' : 
              (user.isVoiceAiEnabled ? 'approved' : 'not_requested')
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking Voice AI access status:', error);
    return NextResponse.json(
      { error: 'Failed to check access status' },
      { status: 500 }
    );
  }
}
