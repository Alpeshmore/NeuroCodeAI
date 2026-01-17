# ProjectBridge - Deployment Guide

## Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Prerequisites
- Heroku account ([Sign up](https://signup.heroku.com/))
- Heroku CLI installed ([Download](https://devcenter.heroku.com/articles/heroku-cli))

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create projectbridge-app
```

3. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

Or set your own MongoDB URI:
```bash
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET="your_super_secret_key"
heroku config:set NODE_ENV="production"
```

5. **Prepare for Deployment**

Add to `server/index.js` (before routes):
```javascript
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "cd client && npm install && npm run build",
    "heroku-postbuild": "npm run build"
  }
}
```

6. **Deploy**
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

7. **Open App**
```bash
heroku open
```

---

### Option 2: Railway

#### Prerequisites
- Railway account ([Sign up](https://railway.app/))

#### Steps

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure Environment Variables**
   - Go to project settings
   - Add variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`

3. **Configure Build**
   - Railway auto-detects Node.js
   - Add build command: `npm run build`
   - Add start command: `npm start`

4. **Deploy**
   - Railway automatically deploys on push
   - Get deployment URL from dashboard

---

### Option 3: Vercel (Frontend) + Railway/Heroku (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy Frontend**
```bash
cd client
vercel
```

3. **Configure Environment**
   - Add `VITE_API_URL` pointing to backend URL

4. **Update API calls**
```javascript
// client/src/utils/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
```

#### Backend on Railway/Heroku
- Follow Railway or Heroku steps above for backend only

---

### Option 4: DigitalOcean App Platform

#### Prerequisites
- DigitalOcean account
- GitHub repository

#### Steps

1. **Create New App**
   - Go to App Platform
   - Connect GitHub repository

2. **Configure Components**
   - **Web Service (Backend):**
     - Build command: `npm install`
     - Run command: `npm start`
     - Port: 5000
   
   - **Static Site (Frontend):**
     - Build command: `cd client && npm install && npm run build`
     - Output directory: `client/dist`

3. **Add Database**
   - Add MongoDB database component
   - Or use MongoDB Atlas

4. **Set Environment Variables**
   - Add all required variables
   - Use database connection string

5. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

---

### Option 5: AWS (Advanced)

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
eb init
```

3. **Create Environment**
```bash
eb create projectbridge-env
```

4. **Set Environment Variables**
```bash
eb setenv MONGODB_URI="your_uri" JWT_SECRET="your_secret"
```

5. **Deploy**
```bash
eb deploy
```

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Configure Access**
   - Database Access: Create user with password
   - Network Access: Add IP (0.0.0.0/0 for all IPs)

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

5. **Use in Application**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectbridge?retryWrites=true&w=majority
```

### Option 2: MongoDB on VPS

If deploying to VPS (DigitalOcean, Linode, etc.):

1. **Install MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

2. **Configure MongoDB**
```bash
sudo nano /etc/mongodb.conf
```

3. **Create Database User**
```bash
mongo
use projectbridge
db.createUser({
  user: "projectbridge_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

---

## Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up MongoDB authentication
- [ ] Configure CORS for specific domains
- [ ] Add rate limiting
- [ ] Implement input sanitization
- [ ] Add helmet.js for security headers

### Performance
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Minify frontend assets
- [ ] Add caching headers
- [ ] Use CDN for static assets
- [ ] Database indexing
- [ ] Connection pooling

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Add analytics (Google Analytics, Mixpanel)
- [ ] Monitor uptime (UptimeRobot, Pingdom)
- [ ] Set up alerts
- [ ] Database backups

### Code Quality
- [ ] Remove console.logs
- [ ] Fix all warnings
- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Cross-browser testing
- [ ] Load testing

---

## Production Configuration

### Backend (server/index.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));

// MongoDB connection with options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Frontend Environment Variables

Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## Post-Deployment

### Testing

1. **Functionality Testing**
   - Register as company
   - Register as developer
   - Create project
   - Apply to project
   - Shortlist applicant
   - Submit solution
   - Select winner

2. **Performance Testing**
   - Page load times
   - API response times
   - Database query performance

3. **Security Testing**
   - Test authentication
   - Try unauthorized access
   - Check HTTPS
   - Verify CORS

### Monitoring

1. **Set Up Logging**
```bash
# Install Winston
npm install winston

# Add to server/index.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Database Backups**
   - MongoDB Atlas: Automatic backups
   - Self-hosted: Set up cron jobs

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Set up email alerts

---

## Troubleshooting Deployment Issues

### Build Fails

**Issue:** Frontend build fails
```bash
# Solution: Check Node version
node --version  # Should be 16+

# Clear cache and rebuild
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Fails

**Issue:** Can't connect to MongoDB
```bash
# Check connection string format
# Ensure IP whitelist includes deployment server
# Verify database user credentials
```

### CORS Errors

**Issue:** Frontend can't access backend
```javascript
// Update CORS configuration
app.use(cors({
  origin: ['https://your-frontend.com', 'http://localhost:5173'],
  credentials: true
}));
```

### Environment Variables Not Working

**Issue:** App can't read .env variables
```bash
# Ensure variables are set in hosting platform
# Check variable names (case-sensitive)
# Restart application after setting variables
```

---

## Scaling Considerations

### When to Scale

- Response times > 1 second
- Database queries slow
- High CPU/memory usage
- Increased user traffic

### Scaling Strategies

1. **Horizontal Scaling**
   - Add more server instances
   - Use load balancer
   - Session management with Redis

2. **Database Scaling**
   - MongoDB sharding
   - Read replicas
   - Indexing optimization

3. **Caching**
   - Redis for session storage
   - CDN for static assets
   - API response caching

4. **Microservices**
   - Separate auth service
   - Separate messaging service
   - API gateway

---

## Maintenance

### Regular Tasks

- [ ] Update dependencies monthly
- [ ] Review error logs weekly
- [ ] Database cleanup quarterly
- [ ] Security audit quarterly
- [ ] Performance optimization
- [ ] Backup verification
- [ ] SSL certificate renewal

### Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm test
```

---

## Support & Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Heroku Docs:** https://devcenter.heroku.com/
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **DigitalOcean Docs:** https://docs.digitalocean.com/

---

## Success Checklist

- [ ] Application deployed and accessible
- [ ] HTTPS enabled
- [ ] Database connected
- [ ] All features working
- [ ] Mobile responsive
- [ ] Error logging set up
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Documentation updated
- [ ] Team trained

Congratulations on deploying ProjectBridge! 🎉
