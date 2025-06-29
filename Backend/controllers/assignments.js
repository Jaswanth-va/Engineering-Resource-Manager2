const Assignment = require("../models/assignment.js");
const User = require("../models/user.js");
const Project = require("../models/project.js");

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const { engineerId, projectId, allocationPercentage, startDate, endDate } =
      req.body;

    // Check if user is manager
    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create assignments" });
    }

    // Check if engineer exists
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check engineer capacity
    const capacity = await Assignment.getEngineerCapacity(engineerId);
    if (capacity.availableCapacity < allocationPercentage) {
      return res.status(400).json({
        message: `Engineer only has ${capacity.availableCapacity}% capacity available`,
      });
    }

    const assignment = new Assignment({
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      assignedBy: req.user.userId,
    });

    await assignment.save();

    // Update project status based on assignment creation
    const existingAssignments = await Assignment.find({ projectId });
    if (existingAssignments.length === 1) {
      // This is the first assignment, set project to active
      await Project.findByIdAndUpdate(projectId, { status: "active" });
    } else if (project.status === "completed") {
      // If project was completed and new assignment is created, set it back to active
      await Project.findByIdAndUpdate(projectId, { status: "active" });
    }

    const populatedAssignment = await assignment.populate([
      { path: "engineerId", select: "name email skills seniority jobType" },
      { path: "projectId", select: "name description status" },
      { path: "assignedBy", select: "name" },
    ]);

    res.status(201).json(populatedAssignment);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Engineer is already assigned to this project" });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get all assignments (for managers)
const getAllAssignments = async (req, res) => {
  try {
    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can view all assignments" });
    }

    const assignments = await Assignment.find()
      .populate("engineerId", "name email skills seniority jobType")
      .populate("projectId", "name description status startDate endDate")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get engineer's assignments
const getEngineerAssignments = async (req, res) => {
  try {
    const engineerId = req.user.userId;

    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const assignments = await Assignment.find({ engineerId })
      .populate(
        "projectId",
        "name description status startDate endDate requiredSkills"
      )
      .populate("assignedBy", "name")
      .sort({ startDate: -1 });

    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get engineer capacity
const getEngineerCapacity = async (req, res) => {
  try {
    const { engineerId } = req.params;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can view engineer capacity" });
    }

    const capacity = await Assignment.getEngineerCapacity(engineerId);

    const engineer = await User.findById(engineerId).select(
      "name email skills seniority jobType"
    );

    res.status(200).json({
      engineer,
      capacity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocationPercentage, startDate, endDate, status } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check permissions
    if (user.role === "engineer") {
      // Engineers can only update their own assignments and only the status field
      if (assignment.engineerId.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only update your own assignments",
        });
      }

      // Engineers can only update status, not other fields
      if (
        allocationPercentage !== undefined ||
        startDate !== undefined ||
        endDate !== undefined
      ) {
        return res.status(403).json({
          message: "Engineers can only update assignment status",
        });
      }

      // Engineers can only change status to 'completed' or 'cancelled'
      if (status && !["completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message:
            "Engineers can only mark assignments as completed or cancelled",
        });
      }
    } else if (user.role === "manager") {
      // Managers can update any assignment
      // If updating allocation percentage, check capacity
      if (allocationPercentage !== undefined) {
        const capacity = await Assignment.getEngineerCapacity(
          assignment.engineerId
        );
        const currentAllocation = assignment.allocationPercentage;
        const availableCapacity =
          capacity.availableCapacity + currentAllocation;

        if (availableCapacity < allocationPercentage) {
          return res.status(400).json({
            message: `Engineer only has ${availableCapacity}% capacity available`,
          });
        }
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update the assignment
    const updateData = {};
    if (allocationPercentage !== undefined)
      updateData.allocationPercentage = allocationPercentage;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate([
      { path: "engineerId", select: "name email skills seniority jobType" },
      { path: "projectId", select: "name description status" },
      { path: "assignedBy", select: "name" },
    ]);

    // Update project status based on assignment status changes
    if (status !== undefined) {
      await updateProjectStatus(assignment.projectId);
    }

    res.status(200).json(updatedAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to update project status based on assignments
const updateProjectStatus = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    const assignments = await Assignment.find({ projectId });

    if (assignments.length === 0) {
      // No assignments - set to planning
      await Project.findByIdAndUpdate(projectId, { status: "planning" });
    } else {
      const activeAssignments = assignments.filter(
        (a) => a.status === "active"
      );
      const completedAssignments = assignments.filter(
        (a) => a.status === "completed"
      );

      if (activeAssignments.length === 0 && completedAssignments.length > 0) {
        // All assignments are completed - set to completed
        await Project.findByIdAndUpdate(projectId, { status: "completed" });
      } else if (activeAssignments.length > 0) {
        // Has active assignments - set to active
        await Project.findByIdAndUpdate(projectId, { status: "active" });
      } else {
        // Only cancelled assignments or no valid assignments - set to planning
        await Project.findByIdAndUpdate(projectId, { status: "planning" });
      }
    }
  } catch (err) {
    console.error("Error updating project status:", err);
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can delete assignments" });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const projectId = assignment.projectId;

    const deletedAssignment = await Assignment.findByIdAndDelete(id);
    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Update project status after assignment deletion
    await updateProjectStatus(projectId);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get suitable engineers for a project
const getSuitableEngineers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can view suitable engineers" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const suitableEngineers = await Assignment.findSuitableEngineers(
      projectId,
      project.requiredSkills
    );

    res.status(200).json(suitableEngineers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getEngineerAssignments,
  getEngineerCapacity,
  updateAssignment,
  deleteAssignment,
  getSuitableEngineers,
};
