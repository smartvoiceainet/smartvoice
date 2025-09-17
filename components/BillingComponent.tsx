"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import config from "@/config";
import TestUserButton from "./TestUserButton";
import UserDebugButton from "./UserDebugButton";

interface BillingComponentProps {
  user: {
    _id: string;
    email: string;
    customerId?: string;
    priceId?: string;
    hasAccess?: boolean;
  };
}

const BillingComponent = ({ user }: BillingComponentProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingPortal = async () => {
    setIsLoading(true);

    try {
      const response: any = await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      });
      const { url } = response;

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  const getCurrentPlan = () => {
    if (!user.priceId) return null;
    
    return config.stripe.plans.find(plan => {
      // Direct match
      if (plan.priceId === user.priceId) return true;
      
      // Check if the conditional priceId matches
      const planPriceId = process.env.NODE_ENV === "development" 
        ? (typeof plan.priceId === 'string' ? plan.priceId : plan.priceId)
        : (typeof plan.priceId === 'string' ? plan.priceId : plan.priceId);
      
      return planPriceId === user.priceId;
    });
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="space-y-8">
      {/* Debug Information */}
      <div className="card bg-info/10 border border-info/20 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Debug Information</h2>
          <div className="text-sm space-y-2">
            <p><strong>User ID:</strong> {user._id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Has Access:</strong> {user.hasAccess ? 'Yes' : 'No'}</p>
            <p><strong>Customer ID:</strong> {user.customerId || 'None'}</p>
            <p><strong>Price ID:</strong> {user.priceId || 'None'}</p>
            <p><strong>Current Plan Found:</strong> {currentPlan ? currentPlan.name : 'None'}</p>
          </div>
        </div>
      </div>

      {/* Debug Tools */}
      <UserDebugButton />

      {/* Test User Button - Only show if no subscription */}
      {!user.hasAccess && !user.customerId && (
        <TestUserButton />
      )}

      {/* Current Subscription Status */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Current Subscription</h2>
          
          {user.hasAccess && currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <p className="text-base-content/70">{currentPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${currentPlan.price}</div>
                  <div className="text-sm text-base-content/70">per month</div>
                </div>
              </div>
              
              <div className="divider"></div>
              
              <div>
                <h4 className="font-semibold mb-2">Plan Features:</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">
                        {typeof feature === 'string' ? feature : feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-warning text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
              <p className="text-base-content/70 mb-4">
                You don't have an active subscription yet. Choose a plan to get started with Smart Voice AI.
              </p>
              <button
                onClick={() => router.push("/#pricing")}
                className="btn btn-primary"
              >
                View Pricing Plans
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Billing Management */}
      {user.customerId && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Billing Management</h2>
            <p className="text-base-content/70 mb-6">
              Access your Stripe Customer Portal to manage your subscription, update payment methods, 
              view invoices, and download receipts.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">What you can do:</h4>
                <ul className="text-sm space-y-1 text-base-content/70">
                  <li>• Update payment methods</li>
                  <li>• View and download invoices</li>
                  <li>• Update billing address</li>
                  <li>• Change subscription plan</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Subscription management:</h4>
                <ul className="text-sm space-y-1 text-base-content/70">
                  <li>• Cancel subscription</li>
                  <li>• Pause subscription</li>
                  <li>• View usage and billing history</li>
                  <li>• Set up tax information</li>
                </ul>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleBillingPortal}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Manage Billing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Account Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                value={user.email || 'Not available'}
                className="input input-bordered w-full"
                disabled
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text font-semibold">Account Status</span>
              </label>
              <div className="flex items-center gap-2">
                <div className={`badge ${user.hasAccess ? 'badge-success' : 'badge-warning'}`}>
                  {user.hasAccess ? 'Active' : 'Inactive'}
                </div>
                {user.hasAccess && (
                  <span className="text-sm text-base-content/70">
                    Subscription active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">
              <span className="label-text font-semibold">User ID</span>
            </label>
            <input
              type="text"
              value={user._id || 'Not available'}
              className="input input-bordered w-full font-mono text-sm"
              disabled
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Your unique account identifier
              </span>
            </div>
          </div>

          {user.customerId && (
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-semibold">Customer ID</span>
              </label>
              <input
                type="text"
                value={user.customerId}
                className="input input-bordered w-full font-mono text-sm"
                disabled
              />
              <div className="label">
                <span className="label-text-alt text-base-content/60">
                  This is your Stripe Customer ID for support purposes
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="card bg-primary/10 border border-primary/20 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Need Help?</h2>
          <p className="text-base-content/80 mb-4">
            If you have questions about your billing or need assistance with your subscription, 
            our support team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@smartvoiceai.net"
              className="btn btn-outline"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Support
            </a>
            
            <button
              onClick={() => router.push("/support")}
              className="btn btn-outline"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingComponent;
