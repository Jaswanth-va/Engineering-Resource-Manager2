const { configDotenv } = require("dotenv");
configDotenv();
const express = require("express");
const connectDB = require("./db/connectDb.js");
const userRouter = require("./router/user.js");
const routeNotFoundMiddleware = require("./middleware/notFound.js");
const errorHandlerMiddleware = require("./middleware/errorHandler.js");
const engineerRouter = require("./router/engineers.js");
const projectRouter = require("./router/projects.js");
const assignmentRouter = require("./router/assignments.js");
const authenticateMiddleware = require("./middleware/authentication.js");

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRouter);
app.use("/api/engineers", authenticateMiddleware, engineerRouter);
app.use("/api/projects", authenticateMiddleware, projectRouter);
app.use("/api/assignments", authenticateMiddleware, assignmentRouter);

app.use(routeNotFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("database connected");
    app.listen(port, () => {
      console.log("server live on port " + port);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
