import mongoose, { Schema, Document } from 'mongoose';

interface IPayment extends Document {
  researcherId: string; // Changed from ObjectId to string
  bankDetails: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountHolderName?: string;
  };
  earnings: {
    totalEarned: number;
    availableBalance: number;
    totalWithdrawn: number;
    currency: string;
  };
  paperRewards: Array<{
    paperId: mongoose.Types.ObjectId;
    paperTitle: string;
    submittedAt: Date;
    approvedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
    rewardAmount: number; // $1 per approved paper
    rewardPaid: boolean;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'failed';
    requestedAt: Date;
    processedAt: Date;
    bankDetails: {
      accountNumber: string;
      bankName: string;
    };
  }>;
  withdrawalSettings: {
    minimumAmount: number; // $20 threshold
  };
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema: Schema = new mongoose.Schema<IPayment>({
  researcherId: { 
    type: String, // Changed from ObjectId to String
    required: true,
    unique: true
  },
  bankDetails: {
    accountNumber: { type: String },
    routingNumber: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String }
  },
  earnings: {
    totalEarned: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  paperRewards: [{
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
    paperTitle: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    approvedAt: { type: Date },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      required: true 
    },
    rewardAmount: { type: Number, default: 1.00 }, // $1 per approved paper
    rewardPaid: { type: Boolean, default: false }
  }],
  withdrawals: [{
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { 
      type: String, 
      enum: ['completed', 'failed'], 
      default: 'completed' 
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: Date.now },
    bankDetails: {
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true }
    }
  }],
  withdrawalSettings: {
    minimumAmount: { type: Number, default: 20 } // $20 minimum threshold
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended'], 
    default: 'active' 
  }
}, {
  timestamps: true
});

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;