"use client";

import { useState } from "react";
import apiClient from "@/libs/api";

const TestUserButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateTestUser = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response: any = await apiClient.post("/test/update-user", {
        customerId: "cus_test123456789",
        priceId: "price_1S7gDBCfUZVQsDHFBBw0dfOv", // Basic plan
        hasAccess: true
      });

      setMessage("✅ User updated with test subscription data! Refresh the page to see changes.");
    } catch (e) {
      console.error(e);
      setMessage("❌ Error updating user. Check console for details.");
    }

    setIsLoading(false);
  };

  return (
    <div className="card bg-warning/10 border border-warning/20 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">Test Subscription Data</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Since you don't have an active subscription yet, you can simulate one for testing purposes.
        </p>
        
        <button
          onClick={updateTestUser}
          disabled={isLoading}
          className="btn btn-warning btn-sm"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Updating...
            </>
          ) : (
            "Add Test Subscription Data"
          )}
        </button>
        
        {message && (
          <div className="mt-3 p-3 bg-base-100 rounded text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUserButton;
