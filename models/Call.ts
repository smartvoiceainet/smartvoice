import mongoose, { Schema, Document, Model } from 'mongoose';

export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  FORWARDING = 'forwarding',
  COMPLETED = 'completed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export interface ICall extends Document {
  vapiCallId: string;
  clientId: mongoose.Types.ObjectId;
  assistantId: mongoose.Types.ObjectId;
  phoneNumber: string;
  status: CallStatus;
  timing: {
    createdAt: Date;
    startedAt?: Date;
    endedAt?: Date;
    durationSeconds: number;
  };
  content: {
    transcript?: string;
    summary?: string;
    recording?: {
      url?: string;
      duration?: number;
    };
  };
  analysis: {
    isQualified: boolean;
    caseType?: string;
    estimatedValue?: number;
    qualificationScore?: number;
    sentiment?: string;
    keywords?: string[];
  };
  cost: number;
  rawData: any;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema: Schema = new Schema({
  vapiCallId: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  assistantId: {
    type: Schema.Types.ObjectId,
    ref: 'VapiAssistant',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(CallStatus),
    default: CallStatus.QUEUED
  },
  timing: {
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    },
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  content: {
    transcript: {
      type: String
    },
    summary: {
      type: String
    },
    recording: {
      url: {
        type: String
      },
      duration: {
        type: Number
      }
    }
  },
  analysis: {
    isQualified: {
      type: Boolean,
      default: false
    },
    caseType: {
      type: String
    },
    estimatedValue: {
      type: Number
    },
    qualificationScore: {
      type: Number
    },
    sentiment: {
      type: String
    },
    keywords: {
      type: [String]
    }
  },
  cost: {
    type: Number,
    default: 0
  },
  rawData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
CallSchema.index({ 'timing.createdAt': -1 });
CallSchema.index({ status: 1 });
CallSchema.index({ 'analysis.isQualified': 1 });
CallSchema.index({ clientId: 1, 'timing.createdAt': -1 }); // For client-specific queries
CallSchema.index({ assistantId: 1, 'timing.createdAt': -1 }); // For assistant-specific queries
CallSchema.index({ clientId: 1, assistantId: 1, 'timing.createdAt': -1 }); // For client+assistant queries

// Handle the case where mongoose.models might be undefined
let CallModel: mongoose.Model<ICall>;
try {
  CallModel = mongoose.models.Call as mongoose.Model<ICall> || mongoose.model<ICall>('Call', CallSchema);
} catch (error) {
  CallModel = mongoose.model<ICall>('Call', CallSchema);
}

export default CallModel;
