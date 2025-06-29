const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    allocationPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique engineer-project combinations
assignmentSchema.index({ engineerId: 1, projectId: 1 }, { unique: true });

// Calculate available capacity for an engineer
assignmentSchema.statics.getEngineerCapacity = async function (engineerId) {
  const engineer = await mongoose.model("User").findById(engineerId);
  if (!engineer || engineer.role !== "engineer") {
    throw new Error("Engineer not found");
  }

  const maxCapacity = engineer.jobType === "full-time" ? 100 : 50;

  const activeAssignments = await this.find({
    engineerId,
    status: "active",
    endDate: { $gte: new Date() },
  });

  const totalAllocated = activeAssignments.reduce((sum, assignment) => {
    return sum + assignment.allocationPercentage;
  }, 0);

  return {
    maxCapacity,
    totalAllocated,
    availableCapacity: Math.max(0, maxCapacity - totalAllocated),
    assignments: activeAssignments,
  };
};

// Find suitable engineers for a project
assignmentSchema.statics.findSuitableEngineers = async function (
  projectId,
  requiredSkills
) {
  const engineers = await mongoose.model("User").find({
    role: "engineer",
    skills: { $in: requiredSkills },
  });

  const engineersWithCapacity = await Promise.all(
    engineers.map(async (engineer) => {
      const capacity = await this.getEngineerCapacity(engineer._id);
      return {
        engineer,
        capacity,
      };
    })
  );

  return engineersWithCapacity.filter(
    (item) => item.capacity.availableCapacity > 0
  );
};

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
