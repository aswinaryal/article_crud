const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const express = require("express");
const cluster = require("cluster");
dotenv.config({ path: "./.env" });

const userRouter = require("./routes/userRouter");
const articleRouter = require("./routes/articleRouter");

const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.use(express.json());

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL
});

const PORT = process.env.PORT || 3000;

app.get("/api/v1/status", (req, res, next) => {
  res.status(200).json({
    status: "OK"
  });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);
app.use(globalErrorHandler);

const cpuCount = require("os").cpus().length;

if (cpuCount > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < cpuCount; i++) {
      cluster.fork();
    }
  } else {
    app.listen(PORT, () => {
      console.log(
        `server started at port ${PORT} with process id ${process.pid}`
      );
    });
  }
} else {
  app.listen(PORT, () => {
    console.log(
      `server started at port ${PORT} with process id ${process.pid}`
    );
  });
}
