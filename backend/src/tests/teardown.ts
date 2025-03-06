import mongoose from 'mongoose';

export default async function () {
  await mongoose.disconnect();
  process.exit(0);
}
