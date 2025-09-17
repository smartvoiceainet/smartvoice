import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

// Manually sync user's Stripe data by email
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

    // Search for customer by email in Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 10
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        message: "No Stripe customer found with this email",
        email: user.email,
        foundCustomers: 0
      });
    }

    // Get the most recent customer
    const customer = customers.data[0];
    
    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    });

    let syncResult = {
      customerFound: true,
      customerId: customer.id,
      customerEmail: customer.email,
      subscriptions: subscriptions.data.length,
      updated: false,
      userBefore: {
        customerId: user.customerId,
        priceId: user.priceId,
        hasAccess: user.hasAccess
      },
      userAfter: null as any
    };

    if (subscriptions.data.length > 0) {
      // Get the first active subscription
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0]?.price.id;

      // Update user with real Stripe data
      user.customerId = customer.id;
      user.priceId = priceId;
      user.hasAccess = true;
      
      await user.save();

      syncResult.updated = true;
      syncResult.userAfter = {
        customerId: user.customerId,
        priceId: user.priceId,
        hasAccess: user.hasAccess
      };
    }

    return NextResponse.json({
      message: "Stripe sync completed",
      ...syncResult,
      subscriptionDetails: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        priceId: sub.items.data[0]?.price.id,
        created: new Date(sub.created * 1000).toISOString()
      }))
    });

  } catch (e) {
    console.error("Stripe sync error:", e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
