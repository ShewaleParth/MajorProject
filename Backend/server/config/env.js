// Environment validation
const requiredEnvVars = [
  'MONGODB_URI',
  'PORT'
];

const optionalEnvVars = [
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'NODE_ENV'
];

const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  // Warn about optional but important variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`⚠️  Optional environment variable not set: ${varName}`);
    }
  });

  // Validate JWT_SECRET strength if provided
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
  }

  // Set default JWT_SECRET if not provided (development only)
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ JWT_SECRET is required in production');
      process.exit(1);
    } else {
      console.warn('⚠️  Using default JWT_SECRET for development. Set JWT_SECRET in .env for production!');
    }
  }
};

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production-minimum-32-chars',
  JWT_EXPIRES_IN: '7d',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  validateEnv
};
