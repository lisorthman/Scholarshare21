declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(options: { buffer: Buffer }): Promise<ExtractResult>;
}