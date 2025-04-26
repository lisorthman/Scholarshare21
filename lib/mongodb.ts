import { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    [x: string]: any;
    promise: Promise<Mongoose> | null;
    conn: Mongoose | null;
  };
}