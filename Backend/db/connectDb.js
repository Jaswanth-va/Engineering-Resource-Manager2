const mongoose = require("mongoose");

function connectDB(URI) {
  mongoose.connect(URI);
}

module.exports = connectDB;
