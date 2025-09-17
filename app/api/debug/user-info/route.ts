import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Debug endpoint to check specific user data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Current user debug information",
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      databaseUser: {
        _id: user._id,
        email: user.email,
        name: user.name,
        customerId: user.customerId,
        priceId: user.priceId,
        hasAccess: user.hasAccess,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
