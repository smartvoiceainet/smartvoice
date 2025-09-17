import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Temporary API endpoint to manually set test subscription data
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    const body = await req.json();
    const { customerId, priceId, hasAccess } = body;

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with test subscription data
    user.customerId = customerId || "cus_test123456789";
    user.priceId = priceId || "price_1S7gDBCfUZVQsDHFBBw0dfOv"; // Basic plan
    user.hasAccess = hasAccess !== undefined ? hasAccess : true;

    await user.save();

    return NextResponse.json({ 
      message: "User updated successfully",
      user: {
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
