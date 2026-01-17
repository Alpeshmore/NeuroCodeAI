const express = require('express');
const Message = require('../models/Message');
const Application = require('../models/Application');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, receiverId, content } = req.body;

    // Verify access (must be company owner or shortlisted developer)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isCompanyOwner = project.company.toString() === req.userId;
    const application = await Application.findOne({ 
      project: projectId, 
      developer: req.userId,
      status: 'shortlisted'
    });

    if (!isCompanyOwner && !application) {
      return res.status(403).json({ message: 'Not authorized to message' });
    }

    const message = new Message({
      project: projectId,
      sender: req.userId,
      receiver: receiverId,
      content
    });

    await message.save();
    await message.populate('sender', 'name role');
    await message.populate('receiver', 'name role');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation
router.get('/:projectId/:userId', auth, async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const messages = await Message.find({
      project: projectId,
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    })
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      project: req.params.projectId,
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    })
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
