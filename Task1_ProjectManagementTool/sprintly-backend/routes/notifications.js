const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PATCH /api/notifications/:id/accept
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate('project');
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    // add user to project members
    const Project = require('../models/Project');
    const project = await Project.findById(notification.project._id);
    
    if (!project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
      await project.save();
    }

    // mark notification as read
    notification.read = true;
    await notification.save();

    res.json({ message: 'Invite accepted', project: notification.project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PATCH /api/notifications/:id/decline
router.patch('/:id/decline', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    // remove user from project members
    const Project = require('../models/Project');
    await Project.findByIdAndUpdate(notification.project, {
      $pull: { members: req.user._id },
    });

    // delete notification
    await notification.deleteOne();

    res.json({ message: 'Invite declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;