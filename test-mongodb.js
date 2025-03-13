require('dotenv').config({ path: '.env.local' }); // Load environment variables
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('MongoDB URI:', uri); // Debugging

  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('scholarshare');
    const collection = db.collection('users');

    // Insert a test document
    const result = await collection.insertOne({
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      password: 'password123',
      role: 'user',
    });
    console.log('Test document inserted:', result.insertedId);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testConnection();