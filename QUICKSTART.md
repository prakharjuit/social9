# ⚡ QUICKSTART - Get Social9 Running in 5 Minutes

## 📦 What You're Getting

You have the complete Social9 application code:
- ✅ Backend (Express + Prisma + PostgreSQL)
- ✅ Frontend (React + Vite)
- ✅ Docker setup for database
- ✅ Complete authentication system
- ✅ Ready to run!

---

## 🚀 Step-by-Step Setup

### **1. Install Prerequisites** (Skip if you have these)

Download and install:
- **Node.js** (v20+): https://nodejs.org/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

### **2. Extract Files**

Extract all files to a folder, e.g., `C:\Projects\social9` or `~/Projects/social9`

### **3. Open 3 Terminals**

**Terminal 1 - Database:**
```bash
cd /path/to/social9
docker-compose up -d
```

**Terminal 2 - Backend:**
```bash
cd social9-backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd social9-frontend
npm install
cp .env.example .env
npm run dev
```

### **4. Open Browser**

Go to: http://localhost:5173

### **5. Create Account**

1. Click "Create account"
2. Enter any email/password
3. Click "Create account"
4. You're in! 🎉

---

## ✅ Verify It's Working

You should see:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Can create account
- ✅ Can login
- ✅ See dashboard

---

## 🐛 Quick Fixes

**"npm: command not found"**
→ Install Node.js from https://nodejs.org/

**"docker: command not found"**
→ Install Docker Desktop from https://docker.com/

**"Port already in use"**
→ Kill the process or change port in .env

**"Cannot connect to database"**
→ Run `docker-compose up -d` first

---

## 📞 Next Steps

Once everything is running:

1. ✅ Test signup/login
2. ✅ Check dashboard
3. 📖 Read the full README.md
4. 🔨 Start building Week 2 features!

---

**You're ready to build! 🚀**
