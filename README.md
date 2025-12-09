# Sports Coaching Platform API

A secure Node.js/Express API for connecting students with sports coaches, featuring real-time chat, booking management, and training programs.

## 🚨 Important Security Notice

This application has been updated with comprehensive security measures. **You must update your configuration before running.**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate JWT Secret
```bash
npm run generate-secret
```

### 3. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Use the generated secret from step 2
- `ALLOWED_ORIGINS` - Your frontend URLs (comma-separated)

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[SECURITY.md](SECURITY.md)** - Security features and best practices
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Updating existing integrations
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - All changes made

## 🔒 Security Features

- ✅ JWT authentication with strong secrets
- ✅ Role-based authorization (Student/Coach)
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ MongoDB injection protection
- ✅ XSS protection
- ✅ Secure password reset with tokens
- ✅ WebSocket authentication
- ✅ CORS restrictions
- ✅ Security headers (Helmet.js)

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.io
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize, xss-clean
- **Validation:** express-validator

## 📡 API Endpoints

### Public Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/coaches/search` - Search coaches

### Protected Endpoints (Require JWT)
- `GET /api/students/:userId` - Get student profile
- `PUT /api/students/:userId` - Update student profile
- `GET /api/coaches/:userId` - Get coach profile
- `PUT /api/coaches/:userId` - Update coach profile
- `POST /api/booking/enroll` - Enroll in program
- `GET /api/booking/student/:studentId` - Get student enrollments
- `GET /api/chats/:userId` - Get user chat rooms
- `GET /api/messages/:chatRoomId` - Get chat messages

See [SETUP.md](SETUP.md) for complete API documentation.

## 🔌 WebSocket Events

### Client → Server
- `join` - Join with authenticated user
- `sendMessage` - Send message to chat room
- `typing` - Notify typing status
- `stopTyping` - Stop typing notification
- `markAsRead` - Mark messages as read

### Server → Client
- `receiveMessage` - New message received
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing
- `messagesRead` - Messages marked as read
- `error` - Error occurred

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "userType": "Student"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/students/Student-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## 🌐 CORS Configuration

Update `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## 📦 Project Structure

```
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── bookingController.js
│   ├── chatRoomController.js
│   ├── coachController.js
│   ├── messageController.js
│   └── ...
├── middleware/               # Custom middleware
│   ├── authMiddleware.js
│   ├── authorizationMiddleware.js
│   ├── socketAuthMiddleware.js
│   └── validationMiddleware.js
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Coach.js
│   ├── Student.js
│   └── ...
├── routes/                   # API routes
│   ├── authRoutes.js
│   ├── coachRoutes.js
│   └── ...
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── server.js                 # Main application file
└── package.json              # Dependencies
```

## 🚨 Breaking Changes

If you're updating from a previous version, see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for:
- WebSocket authentication changes
- Password reset flow changes
- New authentication requirements
- CORS restrictions

## 🐛 Troubleshooting

### "Authentication error: No token provided"
- Include JWT token in Authorization header: `Bearer YOUR_TOKEN`

### "Not allowed by CORS"
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### "Too many requests"
- Rate limit exceeded, wait 15 minutes

### MongoDB connection failed
- Check `MONGO_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Confirm database user credentials

See [SETUP.md](SETUP.md) for more troubleshooting tips.

## 📈 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique `JWT_SECRET`
3. Enable HTTPS
4. Set specific `ALLOWED_ORIGINS` (no localhost)
5. Use environment variables (not .env file)
6. Set up monitoring and logging
7. Regular security updates (`npm audit`)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC

## 🔒 Security

For security issues, please see [SECURITY.md](SECURITY.md) or contact the maintainers directly.

## 📞 Support

- Documentation: See docs folder
- Issues: GitHub Issues
- Security: See SECURITY.md

---

**⚠️ Remember to:**
1. Update `.env` with secure values
2. Never commit `.env` to git
3. Rotate credentials if exposed
4. Keep dependencies updated
5. Run `npm audit` regularly
