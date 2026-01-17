const express = require('express');
const Application = require('../models/Application');
const Project = require('../models/Project');
const { auth, isCompany, isDeveloper } = require('../middleware/auth');

const router = express.Router();

// Apply to project (Developer only)
router.post('/', auth, isDeveloper, async (req, res) => {
  try {
    const { projectId, proposal } = req.body;

    // Check if project exists and is open
    const project = await Project.findById(projectId);
    if (!project || project.status !== 'open') {
      return res.status(400).json({ message: 'Project not available' });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ project: projectId, developer: req.userId });
    if (existing) {
      return res.status(400).json({ message: 'Already applied to this project' });
    }

    const application = new Application({
      project: projectId,
      developer: req.userId,
      proposal
    });

    await application.save();
    await application.populate('developer', 'name email skills portfolioLinks');
    await application.populate('project', 'title');

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for a project (Company only)
router.get('/project/:projectId', auth, isCompany, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, company: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const applications = await Application.find({ project: req.params.projectId })
      .populate('developer', 'name email skills experience portfolioLinks bio')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get developer's applications
router.get('/my-applications', auth, isDeveloper, async (req, res) => {
  try {
    const applications = await Application.find({ developer: req.userId })
      .populate('project', 'title description deadline status')
      .populate({
        path: 'project',
        populate: { path: 'company', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Shortlist application (Company only)
router.put('/:id/shortlist', auth, isCompany, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('project');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.project.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = 'shortlisted';
    await application.save();
    await application.populate('developer', 'name email skills');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject application (Company only)
router.put('/:id/reject', auth, isCompany, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('project');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.project.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = 'rejected';
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Select winner (Company only)
router.put('/:id/select', auth, isCompany, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('project');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.project.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = 'selected';
    await application.save();

    // Update project
    const project = await Project.findById(application.project._id);
    project.selectedWinner = application.developer;
    project.status = 'completed';
    await project.save();

    await application.populate('developer', 'name email');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit solution (Developer only)
router.put('/:id/submit', auth, isDeveloper, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, developer: req.userId });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'shortlisted') {
      return res.status(400).json({ message: 'Can only submit if shortlisted' });
    }

    application.submissionLinks = req.body.submissionLinks;
    application.submittedAt = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
