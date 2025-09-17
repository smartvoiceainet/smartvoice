"use client";

import { useState } from "react";
import apiClient from "@/libs/api";

const UserDebugButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkUserInfo = async () => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.get("/debug/user-info");
      setDebugInfo(response);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const resetUserData = async () => {
    setIsResetting(true);
    try {
      const response: any = await apiClient.post("/debug/reset-user");
      setDebugInfo(null);
      alert("✅ User data reset! Refresh the page to see changes.");
    } catch (e) {
      console.error(e);
      alert("❌ Error resetting user data");
    }
    setIsResetting(false);
  };

  const syncStripeData = async () => {
    setIsSyncing(true);
    try {
      const response: any = await apiClient.post("/debug/sync-stripe");
      setDebugInfo(null);
      
      if (response.updated) {
        alert("✅ Stripe data synced successfully! Refresh the page to see your real subscription.");
      } else if (response.customerFound && response.subscriptions === 0) {
        alert("⚠️ Found your Stripe customer but no active subscriptions. You may need to make a purchase.");
      } else {
        alert("⚠️ No Stripe customer found with your email. Make sure you used the same email for your purchase.");
      }
    } catch (e) {
      console.error(e);
      alert("❌ Error syncing Stripe data");
    }
    setIsSyncing(false);
  };

  return (
    <div className="card bg-warning/10 border border-warning/20 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">User Debug Tools</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Debug tools to check and reset your user data if you're seeing incorrect billing information.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={checkUserInfo}
            disabled={isLoading}
            className="btn btn-info btn-sm"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Checking...
              </>
            ) : (
              "Check User Info"
            )}
          </button>

          <button
            onClick={syncStripeData}
            disabled={isSyncing}
            className="btn btn-success btn-sm"
          >
            {isSyncing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Syncing...
              </>
            ) : (
              "Sync Stripe Data"
            )}
          </button>

          <button
            onClick={resetUserData}
            disabled={isResetting}
            className="btn btn-warning btn-sm"
          >
            {isResetting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Resetting...
              </>
            ) : (
              "Reset User Data"
            )}
          </button>
        </div>
        
        {debugInfo && (
          <div className="bg-base-100 rounded p-4 text-xs">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <div className="space-y-2">
              <div>
                <strong>Session:</strong>
                <div className="ml-2">
                  <p>ID: {debugInfo.sessionUser?.id}</p>
                  <p>Email: {debugInfo.sessionUser?.email}</p>
                  <p>Name: {debugInfo.sessionUser?.name}</p>
                </div>
              </div>
              <div>
                <strong>Database:</strong>
                <div className="ml-2">
                  <p>Email: {debugInfo.databaseUser?.email}</p>
                  <p>Customer ID: {debugInfo.databaseUser?.customerId || 'None'}</p>
                  <p>Price ID: {debugInfo.databaseUser?.priceId || 'None'}</p>
                  <p>Has Access: {debugInfo.databaseUser?.hasAccess ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDebugButton;
