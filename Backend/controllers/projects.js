const Project = require("../models/project.js");
const User = require("../models/user.js");
const Assignment = require("../models/assignment.js");

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, requiredSkills } = req.body;

    req.body.managerId = req.user.userId;

    const manager = await User.findById(req.body.managerId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only a manager can create a project" });
    }

    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      managerId: req.body.managerId,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProjectsByManagerId = async (req, res) => {
  try {
    const managerId = req.user.userId;

    const projects = await Project.find({ managerId });

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for this manager" });
    }

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all projects (for managers)
const getAllProjects = async (req, res) => {
  try {
    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can view all projects" });
    }

    const projects = await Project.find().populate("managerId", "name email");
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get project by ID with assignments
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate(
      "managerId",
      "name email"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get assignments for this project
    const assignments = await Assignment.find({ projectId: id })
      .populate("engineerId", "name email skills seniority jobType")
      .populate("assignedBy", "name");

    res.status(200).json({
      project,
      assignments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, requiredSkills, status } =
      req.body;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can update projects" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if manager owns this project
    if (project.managerId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own projects" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, startDate, endDate, requiredSkills, status },
      { new: true }
    ).populate("managerId", "name email");

    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can update project status" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if manager owns this project
    if (project.managerId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own projects" });
    }

    // Validate status
    const validStatuses = ["planning", "active", "completed", "on-hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid project status" });
    }

    // If trying to set status to completed, check if all assignments are completed
    if (status === "completed") {
      const assignments = await Assignment.find({ projectId: id });
      const activeAssignments = assignments.filter(
        (a) => a.status === "active"
      );

      if (activeAssignments.length > 0) {
        return res.status(400).json({
          message:
            "Cannot complete project while there are active assignments. Please complete all assignments first.",
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("managerId", "name email");

    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can delete projects" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete all assignments related to this project first
    const deletedAssignments = await Assignment.deleteMany({ projectId: id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project and all related assignments deleted successfully",
      deletedAssignmentsCount: deletedAssignments.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get projects by status
const getProjectsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can filter projects" });
    }

    const projects = await Project.find({
      status,
      managerId: req.user.userId,
    }).populate("managerId", "name email");

    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProjectsByManagerId,
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectsByStatus,
};
