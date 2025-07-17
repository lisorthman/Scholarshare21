import { Schema, model, models } from "mongoose";

export interface IDownload {
  paperId: string;
  userId: string; // Required as per your requirement
  downloadedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const DownloadSchema = new Schema<IDownload>({
  paperId: { type: String, required: true },
  userId: { type: String, required: true },
  downloadedAt: { type: Date, default: Date.now },
  userAgent: { type: String },
  ipAddress: { type: String },
});

const Download = models.Download || model<IDownload>("Download", DownloadSchema);

export default Download;