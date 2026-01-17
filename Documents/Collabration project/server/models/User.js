const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['company', 'developer'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Company specific fields
  companyDescription: String,
  industry: String,
  
  // Developer specific fields
  skills: [String],
  experience: String,
  portfolioLinks: {
    github: String,
    figma: String,
    website: String,
    other: String
  },
  bio: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
