const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  developer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposal: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected'],
    default: 'applied'
  },
  submissionLinks: {
    github: String,
    figma: String,
    demo: String,
    other: String
  },
  submittedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate applications
applicationSchema.index({ project: 1, developer: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
