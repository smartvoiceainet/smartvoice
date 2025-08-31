import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import config from "@/config";
import dbConnect from "./mongoose";
import { UserRole } from "@/models/User";
import mongoose from "mongoose";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter: any;
}

// Extend session type for Voice AI permissions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Voice AI specific fields
      role?: string;
      isVoiceAiEnabled?: boolean;
      hasVoiceAiAccess?: boolean;
      // Client-specific fields
      clientId?: string;
      isClientUser?: boolean;
      clientUserRole?: string;
      defaultAssistantId?: string;
    };
  }
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        // Enhanced profile with Google OAuth fields
        return {
          id: profile.sub,
          googleId: profile.sub, // Store Google ID for future reference
          name: profile.given_name ? profile.given_name : profile.name,
          firstName: profile.given_name || '',
          lastName: profile.family_name || '',
          email: profile.email,
          image: profile.picture,
          lastLogin: new Date(),
          createdAt: new Date(),
          role: UserRole.PENDING, // New Google users start with PENDING role
          isVoiceAiEnabled: false, // Default to disabled
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: config.resend.fromNoReply,
    }),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  adapter: MongoDBAdapter(async () => {
    await dbConnect();
    const client = new MongoClient(process.env.MONGODB_URI as string);
    return client.connect();
  }),

  callbacks: {
    // Enhance JWT token with user role and permissions
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        // Handle type-safe access to custom fields
        const userWithCustomFields = user as any;
        token.role = userWithCustomFields.role || UserRole.USER;
        token.isVoiceAiEnabled = userWithCustomFields.isVoiceAiEnabled || false;
        
        // Add client and assistant information
        token.clientId = userWithCustomFields.clientId || null;
        token.isClientUser = userWithCustomFields.isClientUser || false;
        token.clientUserRole = userWithCustomFields.clientUserRole || null;
        
        // If this is a Google login, update lastLogin and fetch default assistant if it's a client user
        if (account?.provider === 'google' || account?.provider === 'email') {
          try {
            await dbConnect();
            // Use mongoose to update the user's lastLogin
            const usersCollection = mongoose.connection.collection('users');
            
            await usersCollection.updateOne(
              { _id: new mongoose.Types.ObjectId(user.id) },
              { $set: { lastLogin: new Date() } }
            );
            
            // If this is a client user, fetch their default assistant
            if (userWithCustomFields.isClientUser && userWithCustomFields.clientId) {
              const vapiAssistantsCollection = mongoose.connection.collection('vapiassistants');
              const clientAssistant = await vapiAssistantsCollection.findOne({
                clientId: userWithCustomFields.clientId,
                isActive: true
              }, { sort: { createdAt: -1 } }); // Get the most recently created active assistant
              
              if (clientAssistant) {
                token.defaultAssistantId = clientAssistant._id.toString();
              }
            }
          } catch (error) {
            console.error("Error updating user's login information:", error);
          }
        }
      }
      return token;
    },
    
    // Pass role and permissions to the client session
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVoiceAiEnabled = token.isVoiceAiEnabled as boolean;
        
        // Determine if user has Voice AI access
        session.user.hasVoiceAiAccess = (
          token.isVoiceAiEnabled && 
          token.role !== UserRole.PENDING
        ) as boolean;
        
        // Pass client information to session
        session.user.clientId = token.clientId as string;
        session.user.isClientUser = token.isClientUser as boolean;
        session.user.clientUserRole = token.clientUserRole as string;
        
        // Pass default assistant ID to session
        session.user.defaultAssistantId = token.defaultAssistantId as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  theme: {
    brandColor: "#1472ff", // Smart Voice AI blue color
    // Smart Voice AI logo for the authentication page
    logo: "/images/smart-voice-ai-auth-logo.svg",
    buttonText: "#FFFFFF",
    // Removed unsupported brandText property
  },
  // Debug mode in development only
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
