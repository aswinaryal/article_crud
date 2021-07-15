const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const express = require("express");
const userRouter = require("./routes/userRouter");
const articleRouter = require("./routes/articleRouter");

const globalErrorHandler = require("./controllers/errorController");

dotenv.config({ path: "./.env" });

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
app.use("/api/v1/article", articleRouter);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
