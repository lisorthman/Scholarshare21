declare module '@vercel/blob' {
    export interface PutBlobResult {
      url: string;
      pathname: string;
      contentType: string;
      contentDisposition: string;
    }
  
    export function put(
      pathname: string,
      body: Blob | Buffer | Readable | File | string,
      options?: {
        access?: 'public';
        token?: string;
      }
    ): Promise<PutBlobResult>;
  }