# 🚀 Social9 - Social Media Management Platform

**Social9** is a social media management platform designed for local businesses who cannot afford expensive marketing agencies.

**Features:**
- 📱 Schedule posts to Instagram & LinkedIn
- 🤖 AI-powered content generation
- 📊 Analytics dashboard
- 💼 Industry-specific templates
- 💳 Stripe billing integration

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

---

## 🎯 Quick Start (5 Minutes)

### **Step 1: Clone or Download**

```bash
# If you have this code locally, navigate to the folder
cd social9-project

# Or if you're starting fresh, create the folders
mkdir social9-project
cd social9-project
```

### **Step 2: Start Database & Redis**

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d

# Verify they're running
docker ps
```

You should see both `social9-postgres` and `social9-redis` running.

### **Step 3: Setup Backend**

```bash
# Navigate to backend folder
cd social9-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env file already has the correct DATABASE_URL for Docker:
# DATABASE_URL="postgresql://social9_user:social9_password@localhost:5432/social9_dev?schema=public"

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

✅ **Backend should now be running on http://localhost:5000**

### **Step 4: Setup Frontend (Open New Terminal)**

```bash
# Navigate to frontend folder (from project root)
cd social9-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the frontend dev server
npm run dev
```

✅ **Frontend should now be running on http://localhost:5173**

### **Step 5: Test It Out!**

1. **Open browser:** http://localhost:5173
2. **Click "Create account"**
3. **Fill in the form:**
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Your Name`
   - Business Name: `Test Business`
4. **Click "Create account"**
5. **You should be logged in and see the dashboard!** 🎉

---

## 📁 Project Structure

```
social9-project/
├── docker-compose.yml          # PostgreSQL + Redis setup
├── social9-backend/            # Express API Server
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helper functions
│   │   └── server.js           # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
└── social9-frontend/           # React SPA
    ├── src/
    │   ├── pages/              # Page components
    │   ├── components/         # Reusable components
    │   ├── services/           # API calls
    │   ├── store/              # Zustand stores
    │   ├── App.jsx             # Main app component
    │   └── main.jsx            # Entry point
    ├── .env                    # Environment variables
    └── package.json
```

---

## 🔧 Available Commands

### **Backend Commands**

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm start                # Start server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma generate      # Regenerate Prisma Client
```

### **Frontend Commands**

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build
```

### **Docker Commands**

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

---

## 🌐 API Endpoints

### **Authentication**
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user (requires auth)
```

### **Health Check**
```
GET    /health               # Check if server is running
```

More endpoints coming in Week 2-8!

---

## 🗃️ Database Schema

The database has these main tables:

- **Users** - User accounts and business info
- **SocialAccounts** - Connected Instagram/LinkedIn accounts
- **Posts** - Created posts
- **PlatformPosts** - Post status per platform
- **Templates** - Content templates
- **Analytics** - Usage statistics

View the complete schema in `social9-backend/prisma/schema.prisma`

---

## 🔐 Environment Variables

### **Backend (.env)**

```env
# Server
PORT=5000
NODE_ENV=development

# Database (already configured for Docker)
DATABASE_URL="postgresql://social9_user:social9_password@localhost:5432/social9_dev?schema=public"

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379
```

### **Frontend (.env)**

```env
# API URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### **"Database connection error"**

```bash
# Check if PostgreSQL is running
docker ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### **"Port 5000 already in use"**

```bash
# Kill process using port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
# Then kill the PID shown
```

### **"Cannot find module '@prisma/client'"**

```bash
cd social9-backend
npx prisma generate
npm install
```

### **Frontend not loading**

```bash
# Clear cache and reinstall
cd social9-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## ✅ What's Working Now (Week 1, Day 1)

- ✅ Backend API server
- ✅ PostgreSQL database with Prisma
- ✅ User registration
- ✅ User login with JWT
- ✅ Protected routes
- ✅ Frontend React app with Vite
- ✅ Login/Signup pages
- ✅ Dashboard page
- ✅ Authentication flow
- ✅ State management with Zustand

---

## 🚧 Coming Next (Week 1-2)

- Social account connection (Instagram, LinkedIn)
- OAuth implementation
- Profile management
- Business info setup

---

## 📚 Tech Stack

### **Frontend**
- React 18
- Vite (build tool)
- React Router (routing)
- Zustand (state management)
- Axios (HTTP client)
- Tailwind CSS (styling)

### **Backend**
- Node.js 20
- Express 4
- Prisma ORM
- PostgreSQL 15
- Redis 7
- JWT authentication

---

## 🤝 Need Help?

If you get stuck:

1. Check the **Troubleshooting** section above
2. Review the error messages carefully
3. Make sure all services are running (`docker ps`)
4. Check that you're in the correct directory
5. Verify environment variables are set correctly

---

## 🎉 Success!

If you can:
1. ✅ Sign up for an account
2. ✅ Log in successfully
3. ✅ See the dashboard

**Then everything is working perfectly! You're ready to build!** 🚀

---

## 📝 Next Steps

Ready to continue building? Here's what we'll add next:

**Week 1 (Foundation):**
- ✅ Day 1-2: Project setup (DONE!)
- 🔄 Day 3-4: Complete authentication (password reset, email verification)
- 📅 Day 5-6: Dashboard layout and navigation
- 📅 Day 7: Polish and testing

**Week 2 (Social Accounts):**
- Connect Instagram accounts
- Connect LinkedIn accounts
- OAuth implementation
- Token management

---

**Built with ❤️ for local businesses**
