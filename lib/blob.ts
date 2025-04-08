import { put } from '@vercel/blob';
import { z } from 'zod';

const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  lastModified: z.number(),
});

export const uploadFileToBlob = async (file: File) => {
  try {
    const validatedFile = fileSchema.parse(file);
    const blob = await put(validatedFile.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob;
  } catch (error) {
    console.error('Error uploading file to blob:', error);
    throw new Error('File upload failed. Please check file size and try again.');
  }
};