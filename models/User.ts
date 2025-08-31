import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// User role enum for Voice AI features
export enum UserRole {
  ADMIN = "admin",
  ATTORNEY = "attorney",
  PARALEGAL = "paralegal",
  STAFF = "staff",
  PENDING = "pending",  // For new Google users awaiting role assignment
  USER = "user" // Default role for regular users
}

// Interface for User document with Voice AI fields
export interface IUser extends mongoose.Document {
  name?: string;
  email: string;
  image?: string;
  googleId?: string;
  firstName?: string;
  lastName?: string;
  customerId?: string;
  priceId?: string;
  hasAccess: boolean;
  // Voice AI specific fields
  role: UserRole;
  isVoiceAiEnabled: boolean;
  voiceAiActivatedAt?: Date;
  voiceAiActivatedBy?: mongoose.Types.ObjectId;
  // Client association fields
  clientId?: mongoose.Types.ObjectId;
  isClientUser: boolean;
  clientUserRole?: string; // e.g., 'admin', 'user', 'viewer'
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  hasVoiceAiAccess(): boolean;
  hasPermission(permission: string): boolean;
}

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Google OAuth fields
    googleId: {
      type: String,
      index: true,
      sparse: true
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Voice AI specific fields
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PENDING,
    },
    isVoiceAiEnabled: {
      type: Boolean,
      default: false
    },
    voiceAiActivatedAt: {
      type: Date
    },
    voiceAiActivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Client association fields
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    isClientUser: {
      type: Boolean,
      default: false
    },
    clientUserRole: {
      type: String,
      enum: ['admin', 'user', 'viewer'],
      default: 'user'
    },
    lastLogin: {
      type: Date,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Methods for Voice AI access control
userSchema.methods.hasVoiceAiAccess = function(): boolean {
  const user = this as unknown as IUser;
  return (
    user.isVoiceAiEnabled && 
    user.role !== UserRole.PENDING
  );
};

// Check if user has specific permission for Voice AI features
userSchema.methods.hasPermission = function(permission: string): boolean {
  const user = this as unknown as IUser;
  
  if (!user.hasVoiceAiAccess()) {
    return false;
  }
  
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['view_all', 'manage_users', 'manage_system', 'view_analytics', 'manage_calls'],
    [UserRole.ATTORNEY]: ['view_analytics', 'manage_calls', 'view_cases'],
    [UserRole.PARALEGAL]: ['view_analytics', 'view_calls', 'view_cases'],
    [UserRole.STAFF]: ['view_calls'],
    [UserRole.PENDING]: [],
    [UserRole.USER]: []
  };
  
  return rolePermissions[user.role]?.includes(permission) || false;
};

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// Handle the case where mongoose.models might be undefined
let UserModel: mongoose.Model<IUser>;
try {
  UserModel = mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>("User", userSchema);
} catch (error) {
  UserModel = mongoose.model<IUser>("User", userSchema);
}

export default UserModel;
