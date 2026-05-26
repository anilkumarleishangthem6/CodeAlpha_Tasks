const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");

// @route GET /api/projects
router.get("/", protect, async (req, res) => {
  try {
    const Task = require("../models/Task");
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate("members", "name email");

    // add task count to each project
    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        return { ...project.toObject(), taskCount };
      }),
    );

    res.json(projectsWithCount);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/projects/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members",
      "name email",
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route POST /api/projects
router.post("/", protect, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route PUT /api/projects/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route DELETE /api/projects/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await project.deleteOne();
    res.json({ message: "Project removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route POST /api/projects/:id/invite
router.post("/:id/invite", protect, async (req, res) => {
  const { email } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const User = require("../models/User");
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if already a member
    if (project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User already a member" });
    }

    // check if already a member
    if (project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User already a member" });
    }

    // just create notification — don't add to members yet
    const Notification = require("../models/Notification");
    await Notification.create({
      recipient: userToInvite._id,
      sender: req.user._id,
      type: "invite",
      project: project._id,
      message: `${req.user.name} invited you to join "${project.name}"`,
    });

    res.json({ message: "Invite sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
