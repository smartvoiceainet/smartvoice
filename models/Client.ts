import mongoose from 'mongoose';
import toJSON from './plugins/toJSON';
import { Schema } from 'mongoose';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export interface IClient {
  _id?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  subscription: {
    plan: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
  branding: {
    logoUrl: string;
    primaryColor: string;
    companyWebsite: string;
  };
  settings: {
    timezone: string;
    dateFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    status: {
      type: String,
      enum: Object.values(ClientStatus),
      default: ClientStatus.TRIAL
    },
    subscription: {
      plan: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false }
    },
    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String, default: '#3B82F6' },
      companyWebsite: { type: String }
    },
    settings: {
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
  },
  {
    timestamps: true
  }
);

// Add plugin that converts mongoose to json
clientSchema.plugin(toJSON as any);

// Handle the case where mongoose.models might be undefined
let ClientModel: mongoose.Model<IClient>;
try {
  ClientModel = mongoose.models.Client as mongoose.Model<IClient> || mongoose.model<IClient>("Client", clientSchema);
} catch (error) {
  ClientModel = mongoose.model<IClient>("Client", clientSchema);
}

export default ClientModel;
