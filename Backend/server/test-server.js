// test-server.js - Simple test to debug startup
console.log('=== Starting server test ===');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
  console.log('✅ Dotenv loaded');

  console.log('2. Loading config...');
  const config = require('./config/env');
  console.log('✅ Config loaded');

  console.log('3. Validating environment...');
  config.validateEnv();
  console.log('✅ Environment validated');

  console.log('4. Loading database config...');
  const connectDB = require('./config/database');
  console.log('✅ Database config loaded');

  console.log('5. Loading models...');
  const models = require('./models');
  console.log('✅ Models loaded:', Object.keys(models));

  console.log('6. Loading middleware...');
  const authenticateToken = require('./middleware/auth');
  console.log('✅ Auth middleware loaded');

  console.log('7. Loading routes...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');

  console.log('\n=== All modules loaded successfully! ===\n');
  console.log('Environment:', config.NODE_ENV);
  console.log('Port:', config.PORT);
  console.log('MongoDB URI:', config.MONGODB_URI ? '✅ Set' : '❌ Not set');
  console.log('JWT Secret:', config.JWT_SECRET ? '✅ Set' : '❌ Not set');

} catch (error) {
  console.error('\n❌ Error during startup:');
  console.error(error);
  process.exit(1);
}
