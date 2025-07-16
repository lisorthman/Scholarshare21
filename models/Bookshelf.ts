import mongoose from 'mongoose';

const BookshelfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchPaper',
    required: true
  },
  status: {
    type: String,
    enum: ['read', 'toRead'],
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'bookshelves' // Explicitly set the collection name
});

export const Bookshelf = mongoose.models.Bookshelf || 
  mongoose.model('Bookshelf', BookshelfSchema);