const mongoose = require('mongoose');

// Attempt to read URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in the environment.');
    process.exit(1);
  }

  const start = performance.now();

  try {
    // Connect
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    
    // Measure time
    const end = performance.now();
    const time = Math.round(end - start);
    
    // Get connection details
    const dbName = mongoose.connection.name || 'unknown';
    const host = mongoose.connection.host || 'unknown';

    // Print formatted output
    console.log(`\nOK: Connected to MongoDB [db="${dbName}", host="${host}", time=${time}ms]\n`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`\nFAIL: Connection failed [error="${error.message}"]\n`);
    process.exit(1);
  }
}

testConnection();
