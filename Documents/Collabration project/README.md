# ProjectBridge – Fair Project Collaboration Platform

A full-stack web application connecting Companies with Developers/Designers for project-based collaboration.

## Features

- **Single Platform**: Unified website with role-based access
- **Authentication**: Email/password login with role selection (Company or Developer)
- **Company Features**: Post projects, view applicants, shortlist, select winners
- **Developer Features**: Browse projects, apply, submit solutions, track status
- **Communication**: Internal messaging between companies and shortlisted developers
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create `.env` file in root directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/projectbridge
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. Start MongoDB locally or use MongoDB Atlas

5. Run the application:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:5173`

## Default Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
projectbridge/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── utils/       # API utilities
├── server/              # Express backend
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── index.js         # Server entry
└── package.json
```

## User Roles

### Company
- Create and manage projects
- View and shortlist applicants
- Review submissions
- Select winners

### Developer/Designer
- Browse available projects
- Apply with proposals
- Submit solution links
- Track application status

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project (Company only)
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Applications
- POST `/api/applications` - Apply to project
- GET `/api/applications/project/:projectId` - Get project applications
- PUT `/api/applications/:id/shortlist` - Shortlist applicant
- PUT `/api/applications/:id/select` - Select winner
- PUT `/api/applications/:id/submit` - Submit solution

### Messages
- POST `/api/messages` - Send message
- GET `/api/messages/:projectId/:userId` - Get conversation

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
