import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDailyMetrics extends Document {
  date: Date;
  clientId?: Types.ObjectId;
  assistantId?: Types.ObjectId;
  metrics: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    qualifiedCalls: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    totalCost: number;
    estimatedRevenue: number;
    successRate: number;
    qualificationRate: number;
  };
  hourlyBreakdown: Map<string, number>;
  caseTypeBreakdown: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): any;
}

const DailyMetricsSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    index: true
  },
  assistantId: {
    type: Schema.Types.ObjectId,
    ref: 'VapiAssistant',
    index: true
  },
  metrics: {
    totalCalls: {
      type: Number,
      default: 0
    },
    successfulCalls: {
      type: Number,
      default: 0
    },
    failedCalls: {
      type: Number,
      default: 0
    },
    qualifiedCalls: {
      type: Number,
      default: 0
    },
    totalDurationSeconds: {
      type: Number,
      default: 0
    },
    averageDurationSeconds: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    estimatedRevenue: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    qualificationRate: {
      type: Number,
      default: 0
    }
  },
  hourlyBreakdown: {
    type: Map,
    of: Number,
    default: {}
  },
  caseTypeBreakdown: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
DailyMetricsSchema.index({ date: -1 });
DailyMetricsSchema.index({ clientId: 1, date: -1 });
DailyMetricsSchema.index({ assistantId: 1, date: -1 });
DailyMetricsSchema.index({ clientId: 1, assistantId: 1, date: -1 });

// Create a compound unique index for date + clientId + assistantId combination
// This ensures we have one record per day per client per assistant
DailyMetricsSchema.index(
  { date: 1, clientId: 1, assistantId: 1 }, 
  { unique: true, sparse: true }
);

// Instance method to convert to plain object
DailyMetricsSchema.methods.toJSON = function() {
  const obj = this.toObject();
  // Convert Maps to plain JS objects for serialization
  if (obj.hourlyBreakdown instanceof Map) {
    obj.hourlyBreakdown = Object.fromEntries(obj.hourlyBreakdown);
  }
  if (obj.caseTypeBreakdown instanceof Map) {
    obj.caseTypeBreakdown = Object.fromEntries(obj.caseTypeBreakdown);
  }
  return obj;
};

// Handle the case where mongoose.models might be undefined
let DailyMetricsModel: mongoose.Model<IDailyMetrics>;
try {
  DailyMetricsModel = mongoose.models.DailyMetrics as mongoose.Model<IDailyMetrics> || 
    mongoose.model<IDailyMetrics>('DailyMetrics', DailyMetricsSchema);
} catch (error) {
  DailyMetricsModel = mongoose.model<IDailyMetrics>('DailyMetrics', DailyMetricsSchema);
}

export default DailyMetricsModel;
