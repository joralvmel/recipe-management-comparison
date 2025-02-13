import mongoose from 'mongoose';

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp';
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
