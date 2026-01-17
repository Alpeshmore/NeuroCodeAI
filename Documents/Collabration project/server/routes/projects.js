const express = require('express');
const Project = require('../models/Project');
const { auth, isCompany } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Companies see only their projects
    if (req.userRole === 'company') {
      query.company = req.userId;
    } else {
      // Developers see all open projects
      query.status = 'open';
    }

    const projects = await Project.find(query)
      .populate('company', 'name email industry')
      .populate('selectedWinner', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('company', 'name email industry companyDescription')
      .populate('selectedWinner', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project (Company only)
router.post('/', auth, isCompany, async (req, res) => {
  try {
    const { title, description, requiredSkills, techStack, timeline, deadline } = req.body;

    const project = new Project({
      title,
      description,
      requiredSkills,
      techStack,
      timeline,
      deadline,
      company: req.userId
    });

    await project.save();
    await project.populate('company', 'name email industry');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', auth, isCompany, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, company: req.userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    Object.assign(project, req.body);
    await project.save();
    await project.populate('company', 'name email industry');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, isCompany, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, company: req.userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
