const User = require("../models/user.js");
const Assignment = require("../models/assignment.js");

const getEngineersBySkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: "Skills array cannot be empty" });
    }

    const engineers = await User.find({
      role: "engineer",
      skills: { $in: skills },
    });

    res.status(200).json(engineers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all engineers with their capacity
const getAllEngineers = async (req, res) => {
  try {
    const manager = await User.findById(req.user.userId);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can view all engineers" });
    }

    const engineers = await User.find({ role: "engineer" }).select("-password");

    // Get capacity for each engineer
    const engineersWithCapacity = await Promise.all(
      engineers.map(async (engineer) => {
        try {
          const capacity = await Assignment.getEngineerCapacity(engineer._id);
          return {
            ...engineer.toObject(),
            capacity,
          };
        } catch (err) {
          return {
            ...engineer.toObject(),
            capacity: {
              maxCapacity: engineer.jobType === "full-time" ? 100 : 50,
              totalAllocated: 0,
              availableCapacity: engineer.jobType === "full-time" ? 100 : 50,
              assignments: [],
            },
          };
        }
      })
    );

    res.status(200).json(engineersWithCapacity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get engineer by ID
const getEngineerById = async (req, res) => {
  try {
    const { id } = req.params;

    const engineer = await User.findById(id).select("-password");
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" });
    }

    const capacity = await Assignment.getEngineerCapacity(id);

    res.status(200).json({
      engineer,
      capacity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update engineer profile
const updateEngineerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, skills, seniority, jobType } = req.body;

    // Check if user is updating their own profile or if manager is updating
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.role !== "manager" && req.user.userId !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const engineer = await User.findById(id);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(404).json({ message: "Engineer not found" });
    }

    // If changing job type, check if engineer has active assignments
    if (jobType && jobType !== engineer.jobType) {
      const capacity = await Assignment.getEngineerCapacity(id);
      if (capacity.totalAllocated > 0) {
        return res.status(400).json({
          message:
            "Cannot change job type while engineer has active assignments",
        });
      }
    }

    const updatedEngineer = await User.findByIdAndUpdate(
      id,
      { name, skills, seniority, jobType },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedEngineer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = { ...user.toObject() };

    // If engineer, add capacity information
    if (user.role === "engineer") {
      try {
        const capacity = await Assignment.getEngineerCapacity(user._id);
        profile.capacity = capacity;
      } catch (err) {
        profile.capacity = {
          maxCapacity: user.jobType === "full-time" ? 100 : 50,
          totalAllocated: 0,
          availableCapacity: user.jobType === "full-time" ? 100 : 50,
          assignments: [],
        };
      }
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEngineersBySkills,
  getAllEngineers,
  getEngineerById,
  updateEngineerProfile,
  getCurrentUserProfile,
};
