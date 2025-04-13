// models/User.ts
import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  // ... existing fields ...
  savedPapers: [{
    type: Schema.Types.ObjectId,
    ref: 'ResearchPaper'
  }],
  recentlyViewed: [{
    paperId: {
      type: Schema.Types.ObjectId,
      ref: 'ResearchPaper'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
  // ... other fields ...
});

export default models.User || model('User', UserSchema);