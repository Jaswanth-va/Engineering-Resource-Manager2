const express = require("express");
const {
  createAssignment,
  getAllAssignments,
  getEngineerAssignments,
  getEngineerCapacity,
  updateAssignment,
  deleteAssignment,
  getSuitableEngineers,
} = require("../controllers/assignments.js");

const router = express.Router();

// Assignment routes
router.post("/", createAssignment);
router.get("/", getAllAssignments);
router.get("/my-assignments", getEngineerAssignments);
router.get("/engineer/:engineerId/capacity", getEngineerCapacity);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
router.get("/project/:projectId/suitable-engineers", getSuitableEngineers);

module.exports = router;
