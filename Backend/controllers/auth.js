const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors/index.js");
const User = require("../models/user.js");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      seniority: user.seniority,
      jobType: user.jobType,
    },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      seniority: user.seniority,
      jobType: user.jobType,
    },
    token,
  });
};

const getUserDetails = async (req, res) => {
  const _id = req.user.userId;
  const user = await User.findOne({ _id });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      seniority: user.seniority,
      jobType: user.jobType,
    },
    token,
  });
};

const updateProfile = async (req, res) => {
  const { name, skills, seniority, jobType } = req.body;
  const userId = req.user.userId;

  // Validate required fields
  if (!name || !skills || !seniority || !jobType) {
    throw new BadRequestError("Please provide all required fields");
  }

  // Validate skills array
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new BadRequestError("Please provide at least one skill");
  }

  // Validate seniority
  const validSeniority = ["junior", "mid", "senior"];
  if (!validSeniority.includes(seniority)) {
    throw new BadRequestError("Invalid seniority level");
  }

  // Validate job type
  const validJobTypes = ["full-time", "part-time"];
  if (!validJobTypes.includes(jobType)) {
    throw new BadRequestError("Invalid job type");
  }

  // Find and update user
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Only engineers can update their profile
  if (user.role !== "engineer") {
    throw new UnauthenticatedError("Only engineers can update their profile");
  }

  // Update user fields
  user.name = name;
  user.skills = skills;
  user.seniority = seniority;
  user.jobType = jobType;

  await user.save();

  // Return updated user without password
  const updatedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    seniority: user.seniority,
    jobType: user.jobType,
  };

  res.status(StatusCodes.OK).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
};

module.exports = { register, login, getUserDetails, updateProfile };
