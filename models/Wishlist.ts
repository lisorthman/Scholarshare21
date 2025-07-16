import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  paperId: string;
  createdAt: Date;
}

const WishlistSchema: Schema = new Schema({
  userId: { type: String, required: true },
  paperId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create a compound unique index on userId and paperId
WishlistSchema.index({ userId: 1, paperId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);