import mongoose from 'mongoose';

// Simple schema without validation
const researcherEarningsSchema = new mongoose.Schema({
  bankAccount: {
    accountHolder: String,
    bankName: String,
    accountNumber: String,
    routingNumber: String
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  papersUploaded: [{
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchPaper'
    },
    amount: {
      type: Number,
      default: 1
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  paymentHistory: [{
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }]
}, { 
  timestamps: true,
  strict: false 
});

// Export model
const ResearcherEarnings = mongoose.models.ResearcherEarnings || 
  mongoose.model('ResearcherEarnings', researcherEarningsSchema);

export default ResearcherEarnings;