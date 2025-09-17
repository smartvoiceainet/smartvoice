import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Reset current user's subscription data
export async function POST(req: NextRequest) {
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

    // Reset subscription data to defaults
    user.customerId = undefined;
    user.priceId = undefined;
    user.hasAccess = false;

    await user.save();

    return NextResponse.json({
      message: "User subscription data reset successfully",
      user: {
        _id: user._id,
        email: user.email,
        customerId: user.customerId,
        priceId: user.priceId,
        hasAccess: user.hasAccess
      }
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
