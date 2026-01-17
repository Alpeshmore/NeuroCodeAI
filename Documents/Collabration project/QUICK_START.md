# ProjectBridge - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

Open terminal in project folder and run:

```bash
npm run install-all
```

This installs all dependencies for both backend and frontend.

### Step 2: Setup Environment (1 minute)

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectbridge
JWT_SECRET=change_this_to_random_string_abc123xyz789
NODE_ENV=development
```

**Using MongoDB Atlas?** Replace `MONGODB_URI` with your Atlas connection string.

### Step 3: Start MongoDB (1 minute)

**Option A - Local MongoDB:**

Windows:
```bash
net start MongoDB
```

Mac:
```bash
brew services start mongodb-community
```

Linux:
```bash
sudo systemctl start mongod
```

**Option B - MongoDB Atlas:**
Skip this step if using cloud MongoDB.

### Step 4: Run Application (1 minute)

```bash
npm run dev
```

Wait for:
```
Server running on port 5000
MongoDB connected
```

### Step 5: Open Browser

Navigate to: **http://localhost:5173**

---

## 🎯 Quick Test

### Create Company Account
1. Click "Sign Up"
2. Enter: Name, Email, Password
3. Select "Company" role
4. Click "Create Account"

### Create a Project
1. Click "+ Create Project"
2. Fill in:
   - Title: "Build a Todo App"
   - Description: "Need a React todo app"
   - Skills: "React, JavaScript"
   - Tech Stack: "React, Tailwind"
   - Deadline: Pick a date
3. Click "Create Project"

### Create Developer Account
1. Open **Incognito/Private Window**
2. Go to: http://localhost:5173
3. Click "Sign Up"
4. Enter different email
5. Select "Developer" role
6. Click "Create Account"

### Apply to Project
1. See the project in "Browse Projects"
2. Click on the project
3. Click "Apply to Project"
4. Write a proposal
5. Click "Submit Application"

### Test Full Workflow
1. Switch back to Company account
2. Go to the project
3. See the application
4. Click "Shortlist"
5. Switch to Developer account
6. Click "Submit Solution"
7. Add GitHub/Demo links
8. Switch to Company account
9. Click "Select as Winner"

✅ **Success!** You've completed the full workflow.

---

## 📁 Project Structure

```
projectbridge/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # UI Components
│   │   ├── pages/       # Page Views
│   │   ├── context/     # Auth Context
│   │   └── utils/       # API Utils
│   └── package.json
│
├── server/              # Express Backend
│   ├── models/          # Database Models
│   ├── routes/          # API Routes
│   ├── middleware/      # Auth Middleware
│   └── index.js
│
├── .env                 # Environment Variables
├── package.json         # Root Dependencies
└── README.md            # Documentation
```

---

## 🔑 Key Features

### For Companies
- ✅ Post projects
- ✅ View applicants
- ✅ Shortlist developers
- ✅ Review submissions
- ✅ Select winners

### For Developers
- ✅ Browse projects
- ✅ Apply with proposals
- ✅ Track application status
- ✅ Submit solutions
- ✅ Showcase portfolio

---

## 🛠️ Common Commands

### Development
```bash
npm run dev          # Start both servers
npm run server       # Backend only
npm run client       # Frontend only
```

### Installation
```bash
npm run install-all  # Install all dependencies
```

### Quick Start Scripts
```bash
# Windows
start.bat

# Mac/Linux
chmod +x start.sh
./start.sh
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongooseServerSelectionError
```
**Fix:** 
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Try: `mongodb://127.0.0.1:27017/projectbridge`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Fix:**
- Change PORT in .env to 5001
- Or kill process using port 5000

### Frontend Not Loading
**Fix:**
- Check if backend is running (port 5000)
- Clear browser cache
- Try incognito mode

### Can't Login/Register
**Fix:**
- Check MongoDB connection
- Verify JWT_SECRET in .env
- Check browser console for errors

---

## 📚 Documentation

- **README.md** - Overview and basic info
- **SETUP.md** - Detailed setup instructions
- **FEATURES.md** - Complete feature list
- **DEPLOYMENT.md** - Production deployment guide
- **QUICK_START.md** - This file

---

## 🎨 Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- Vite

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt

---

## 🔐 Default Ports

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017

---

## 📞 Need Help?

1. Check **SETUP.md** for detailed instructions
2. Review **Troubleshooting** section above
3. Check MongoDB connection
4. Verify all dependencies installed
5. Ensure .env file is configured

---

## ✨ Next Steps

After successful setup:

1. **Customize Branding**
   - Update colors in `client/tailwind.config.js`
   - Change app name in `client/index.html`

2. **Add Features**
   - Email notifications
   - Real-time chat
   - File uploads
   - Payment integration

3. **Deploy to Production**
   - See **DEPLOYMENT.md**
   - Use Heroku, Railway, or Vercel

4. **Enhance Security**
   - Add rate limiting
   - Implement 2FA
   - Add email verification

---

## 🎉 You're Ready!

Your ProjectBridge platform is now running. Start connecting companies with talented developers!

**Happy Coding!** 🚀
