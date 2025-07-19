require('dotenv').config({ path: '.env.local' }); // Load environment variables
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function testResearcherApproval() {
  const uri = process.env.MONGODB_URI;

  // Check if environment variables are defined
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  console.log('Testing Researcher Approval Check...');
  console.log('MongoDB URI:', uri);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('scholarshare');
    const usersCollection = db.collection('users');

    // Test 1: Check if a researcher with "Pending" status gets rejected
    console.log('\n=== Test 1: Researcher with Pending Status ===');
    const pendingResearcher = await usersCollection.findOne({ 
      role: 'researcher', 
      status: 'Pending' 
    });
    
    if (pendingResearcher) {
      console.log('Found researcher with Pending status:', pendingResearcher.email);
      console.log('Status:', pendingResearcher.status);
      console.log('Expected: Should be rejected during login');
    } else {
      console.log('No researcher with Pending status found');
    }

    // Test 2: Check if a researcher with "Active" status can log in
    console.log('\n=== Test 2: Researcher with Active Status ===');
    const activeResearcher = await usersCollection.findOne({ 
      role: 'researcher', 
      status: 'Active' 
    });
    
    if (activeResearcher) {
      console.log('Found researcher with Active status:', activeResearcher.email);
      console.log('Status:', activeResearcher.status);
      console.log('Expected: Should be allowed to login');
    } else {
      console.log('No researcher with Active status found');
    }

    // Test 3: Check if a researcher with "Suspended" status gets rejected
    console.log('\n=== Test 3: Researcher with Suspended Status ===');
    const suspendedResearcher = await usersCollection.findOne({ 
      role: 'researcher', 
      status: 'Suspended' 
    });
    
    if (suspendedResearcher) {
      console.log('Found researcher with Suspended status:', suspendedResearcher.email);
      console.log('Status:', suspendedResearcher.status);
      console.log('Expected: Should be rejected during login');
    } else {
      console.log('No researcher with Suspended status found');
    }

    // Test 4: List all researchers and their statuses
    console.log('\n=== Test 4: All Researchers Status Summary ===');
    const allResearchers = await usersCollection.find({ role: 'researcher' }).toArray();
    
    if (allResearchers.length > 0) {
      console.log(`Found ${allResearchers.length} researchers:`);
      allResearchers.forEach((researcher, index) => {
        console.log(`${index + 1}. ${researcher.email} - Status: ${researcher.status}`);
      });
    } else {
      console.log('No researchers found in database');
    }

    // Test 5: Check if regular users and admins are not affected
    console.log('\n=== Test 5: Non-Researcher Users ===');
    const regularUsers = await usersCollection.find({ 
      role: { $in: ['user', 'admin'] } 
    }).limit(3).toArray();
    
    if (regularUsers.length > 0) {
      console.log(`Found ${regularUsers.length} non-researcher users:`);
      regularUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Role: ${user.role} - Status: ${user.status}`);
      });
      console.log('Expected: These users should not be affected by researcher approval check');
    } else {
      console.log('No non-researcher users found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

testResearcherApproval(); 