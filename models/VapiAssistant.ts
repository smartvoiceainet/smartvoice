import mongoose from 'mongoose';
import toJSON from './plugins/toJSON';
import { Schema } from 'mongoose';

export interface IVapiAssistant {
  _id?: string;
  vapiAssistantId: string;
  vapiPhoneNumber: string;
  clientId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  configuration: {
    voiceModel: string;
    language: string;
    personalityPrompt?: string;
    practiceArea?: string;
    qualificationCriteria?: object;
    maxCallDuration: number;
    businessHours?: {
      start: string;
      end: string;
    };
  };
  performance: {
    totalCalls: number;
    successfulCalls: number;
    qualifiedCalls: number;
    totalDuration: number;
    totalCost: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastCallAt?: Date;
}

const vapiAssistantSchema = new Schema<IVapiAssistant>(
  {
    vapiAssistantId: { type: String, required: true, unique: true },
    vapiPhoneNumber: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    configuration: {
      voiceModel: { type: String },
      language: { type: String, default: 'en' },
      personalityPrompt: { type: String },
      practiceArea: { type: String },
      qualificationCriteria: { type: Object },
      maxCallDuration: { type: Number, default: 1800 },
      businessHours: {
        start: { type: String },
        end: { type: String }
      }
    },
    performance: {
      totalCalls: { type: Number, default: 0 },
      successfulCalls: { type: Number, default: 0 },
      qualifiedCalls: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastCallAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Add plugin that converts mongoose to json
vapiAssistantSchema.plugin(toJSON);

// Handle the case where mongoose.models might be undefined
let VapiAssistantModel: mongoose.Model<IVapiAssistant>;
try {
  VapiAssistantModel = mongoose.models.VapiAssistant as mongoose.Model<IVapiAssistant> || 
    mongoose.model<IVapiAssistant>("VapiAssistant", vapiAssistantSchema);
} catch (error) {
  VapiAssistantModel = mongoose.model<IVapiAssistant>("VapiAssistant", vapiAssistantSchema);
}

export default VapiAssistantModel;
