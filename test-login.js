require('dotenv').config({ path: '.env.local' }); // Load environment variables
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function testLogin() {
  const uri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;

  // Check if environment variables are defined
  if (!uri || !jwtSecret) {
    console.error('MONGODB_URI or JWT_SECRET is not defined in .env.local');
    return;
  }

  console.log('MongoDB URI:', uri); // Debugging

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Test login credentials
    const email = 'lisorthman@gmail.com';
    const password = 'liso2002';
    const role = 'admin';

    // Find user by email and role
    const user = await usersCollection.findOne({ email, role });
    if (!user) {
      console.log('User not found:', email); // Debugging
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email); // Debugging
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, {
      expiresIn: '1h',
    });
    console.log('Token generated:', token); // Debugging
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testLogin();