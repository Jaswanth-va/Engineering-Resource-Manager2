const express = require("express");
const {
  getProjectsByManagerId,
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectsByStatus,
} = require("../controllers/projects.js");

const router = express.Router();

// Project routes
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/my-projects", getProjectsByManagerId);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.patch("/:id/status", updateProjectStatus);
router.delete("/:id", deleteProject);
router.get("/status/:status", getProjectsByStatus);

module.exports = router;
