import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

// Debug endpoint to check webhook activity and user data
export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    
    // Get all users with subscription data
    const users = await User.find({
      $or: [
        { customerId: { $exists: true } },
        { priceId: { $exists: true } },
        { hasAccess: true }
      ]
    }).select('email customerId priceId hasAccess createdAt updatedAt');

    return NextResponse.json({
      message: "Webhook debug information",
      totalUsers: users.length,
      users: users,
      webhookEndpoint: "/api/webhook/stripe",
      requiredEnvVars: {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET
      }
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
