# Server Refactoring - Testing Guide

## ✅ Server is Running!

The refactored server is now operational. Here's how to test it:

## Health Check
```bash
curl http://localhost:5000/api/health
```

## Testing Authentication

### 1. Create a New User (Signup)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Verify OTP
Check the console output for the OTP (if email is not configured), then:
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "YOUR_OTP_HERE"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Common Issues & Solutions

### 401 Unauthorized on Login
**Causes:**
1. User doesn't exist - need to signup first
2. Email not verified - need to verify OTP
3. Wrong password
4. Email/password mismatch

**Solution:**
1. Create a new user with signup endpoint
2. Verify email with OTP
3. Then login

### Testing with Frontend
The frontend at `localhost:5173` should work with the refactored server. Make sure:
1. Frontend is pointing to `http://localhost:5000/api`
2. CORS is enabled (already configured in server.new.js)

## Environment Variables

Make sure your `.env` file has:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-at-least-32-characters-long
EMAIL_USER=your_email@gmail.com (optional)
EMAIL_PASS=your_app_password (optional)
```

## Next Steps

1. **Test all endpoints** using the curl commands above
2. **Migrate remaining routes** from old server.js (see REFACTORING_GUIDE.md)
3. **Add input validation** to remaining routes
4. **Write unit tests** for each module

## Folder Structure Summary

```
Backend/server/
├── config/          ✅ Database & environment config
├── models/          ✅ All 6 Mongoose models
├── middleware/      ✅ Auth, error handling, validation, security
├── routes/          ✅ 6 route modules
├── services/        ✅ Email service
├── utils/           ✅ Helper functions
├── server.new.js    ✅ New modular entry point (ACTIVE)
└── server.js        📦 Old monolithic file (backup)
```

## Success! 🎉

Your server architecture is now:
- ✅ Modular and maintainable
- ✅ Secure (removed dev bypass)
- ✅ Industry-standard structure
- ✅ Easy to test and extend
