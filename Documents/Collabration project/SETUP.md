# ProjectBridge Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - **Local MongoDB**: [Download](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud): [Sign up free](https://www.mongodb.com/cloud/atlas/register)
3. **Git** (optional) - [Download](https://git-scm.com/)

## Quick Start

### Step 1: Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm run install-all
```

This will install dependencies for both the backend and frontend.

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
copy .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectbridge
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important Notes:**
- Change `JWT_SECRET` to a random secure string
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/projectbridge`

### Step 3: Start MongoDB (if using local installation)

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 4: Run the Application

Start both backend and frontend servers:

```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:5173`

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Manual Setup (Alternative)

If you prefer to run servers separately:

### Terminal 1 - Backend:
```bash
npm run server
```

### Terminal 2 - Frontend:
```bash
npm run client
```

## Testing the Application

### Create Test Accounts

1. **Register as a Company:**
   - Go to Sign Up
   - Enter name, email, password
   - Select "Company" role
   - Complete registration

2. **Register as a Developer:**
   - Open an incognito/private window
   - Go to Sign Up
   - Enter different email
   - Select "Developer" role
   - Complete registration

### Test Workflow

1. **As Company:**
   - Create a new project
   - Fill in project details
   - View project in dashboard

2. **As Developer:**
   - Browse available projects
   - Apply to a project with a proposal
   - Check "My Applications" tab

3. **As Company:**
   - View applicants for your project
   - Shortlist a developer
   - Review submissions

4. **As Developer:**
   - Submit solution links (GitHub, demo, etc.)
   - Track application status

5. **As Company:**
   - Select winner from shortlisted developers

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError"**

Solution:
- Ensure MongoDB is running
- Check if `MONGODB_URI` in `.env` is correct
- For local MongoDB, try: `mongodb://127.0.0.1:27017/projectbridge`

### Port Already in Use

**Error: "Port 5000 is already in use"**

Solution:
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Loading

Solution:
- Clear browser cache
- Check if backend is running on port 5000
- Verify proxy settings in `client/vite.config.js`

### CORS Errors

Solution:
- Ensure backend is running
- Check that frontend is accessing `http://localhost:5173`
- Verify CORS is enabled in `server/index.js`

## Production Deployment

### Environment Variables for Production

```env
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_long_random_secure_string
NODE_ENV=production
```

### Build Frontend

```bash
cd client
npm run build
```

### Deploy Options

1. **Heroku** - Backend + Frontend
2. **Vercel** - Frontend only
3. **Railway** - Full-stack
4. **DigitalOcean** - VPS hosting
5. **AWS/Azure/GCP** - Cloud platforms

### Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set up MongoDB authentication
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable CORS only for your domain
- [ ] Regular security updates

## Project Structure

```
projectbridge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── index.js          # Server entry
├── .env                  # Environment variables
├── .env.example          # Example env file
├── package.json          # Root package.json
└── README.md             # Documentation
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Project Endpoints

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (Company)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project (Company)
- `DELETE /api/projects/:id` - Delete project (Company)

### Application Endpoints

- `POST /api/applications` - Apply to project (Developer)
- `GET /api/applications/project/:projectId` - Get applications (Company)
- `GET /api/applications/my-applications` - Get my applications (Developer)
- `PUT /api/applications/:id/shortlist` - Shortlist applicant (Company)
- `PUT /api/applications/:id/reject` - Reject applicant (Company)
- `PUT /api/applications/:id/select` - Select winner (Company)
- `PUT /api/applications/:id/submit` - Submit solution (Developer)

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Message Endpoints

- `POST /api/messages` - Send message
- `GET /api/messages/:projectId/:userId` - Get conversation

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check MongoDB connection
4. Verify all dependencies are installed

## Next Steps

After successful setup:
1. Customize the UI/branding
2. Add email notifications
3. Implement real-time messaging
4. Add file upload for portfolios
5. Implement payment integration
6. Add project categories/filters
7. Implement rating system
8. Add analytics dashboard

Happy coding! 🚀
