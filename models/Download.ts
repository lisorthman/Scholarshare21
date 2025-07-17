import { Schema, model, models } from 'mongoose';

const DownloadSchema = new Schema({
  paperId: {
    type: String,
    required: true,
  },
  paperTitle: {
    type: String,
    required: true,
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields like userId if you have user authentication
  userId: {
    type: String,
    required: true,
  },
});

const Download = models.Download || model('Download', DownloadSchema);

export default Download;