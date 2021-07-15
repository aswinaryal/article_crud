const sendError = (err, res) => {
  //operational, trusted error; send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log("💥 NOT OPERATIONAL ERROR 💥");
    //do not send the error to client, since unexpected
    res.status(500).json({
      status: "error",
      message: "Something went wrong"
    });
  }
};

const handleTokenExpiredError = () =>
  new AppError("Token Exipred, Please try again later", 401);

module.exports = (err, req, res, next) => {
  console.log("ERROR 💥", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };

  if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

  sendError(error, res);
};
