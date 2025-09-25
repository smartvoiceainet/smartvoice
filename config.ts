import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Smart Voice AI",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Never miss a client call again. Smart Voice AI answers your calls 24/7, qualifies potential clients, and schedules appointments - all while sounding perfectly human.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "smartvoiceai.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1S7gDBCfUZVQsDHFBBw0dfOv"
            : "price_1S7gDBCfUZVQsDHFBBw0dfOv",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Basic",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for solo attorneys looking to maximize efficiency",
        // The price you want to display, the one user will be charged on Stripe.
        price: 499,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: null,
        features: [
          { name: "Up to 300 calls per month" },
          { name: "Custom voice & script training" },
          { name: "Client intake qualification" },
          { name: "Appointment scheduling" },
          { name: "Text & email notifications" },
          { name: "Case management integration" },
          { name: "9am-5pm technical support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1S7gF6CfUZVQsDHFBxYnXjOF"
            : "price_1S7gF6CfUZVQsDHFBxYnXjOF",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Pro",
        description: "For growing firms with 2-5 attorneys",
        price: 899,
        priceAnchor: null,
        features: [
          { name: "Up to 1,000 calls per month" },
          { name: "Custom voice & script training" },
          { name: "Client intake qualification" },
          { name: "Appointment scheduling" },
          { name: "Text & email notifications" },
          { name: "Case management integration" },
          { name: "Analytics dashboard" },
          { name: "Priority 24/7 technical support" },
          { name: "Dedicated account manager" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1S7gGMCfUZVQsDHFvgWG6cKF"
            : "price_1S7gGMCfUZVQsDHFvgWG6cKF",
        name: "Enterprise",
        description: "For established firms with 6+ attorneys",
        price: 1499,
        priceAnchor: null,
        features: [
          { name: "Up to 2,000 calls per month" },
          { name: "Multiple custom voice profiles" },
          { name: "Advanced call routing logic" },
          { name: "Multi-location support" },
          { name: "Custom API integrations" },
          { name: "White-labeled client portal" },
          { name: "Advanced analytics & reporting" },
          { name: "24/7 VIP technical support" },
          { name: "Quarterly strategy reviews" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `FeNAgO <noreply@resend.fenago.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Dr Lee at FeNAgO <drlee@resend.fenago.com>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "socrates.73@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
