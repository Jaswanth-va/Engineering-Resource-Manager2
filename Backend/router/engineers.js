const express = require("express");
const router = express.Router();
const { getEngineersBySkills } = require("../controllers/users.js");

router.post("/get-engineers", getEngineersBySkills);

module.exports = router;
