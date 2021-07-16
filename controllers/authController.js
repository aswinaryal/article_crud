const AWS = require("aws-sdk");
const AppError = require("../utils/AppError");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const tableName = "User";

const signToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSendToken = (userEmail, statusCode, res) => {
  const token = signToken(userEmail);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userEmail
    }
  });
};

exports.signup = async (req, res, next) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  const { email, password, passwordConfirm } = req.body;

  if (email && password === passwordConfirm) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const params = {
        TableName: tableName,
        Item: {
          id: uuid.v4(),
          email,
          password: hashedPassword
        },
        ConditionExpression: "attribute_not_exists(email)"
      };
      await docClient.put(params).promise();
      return res.status(201).json({
        status: "success",
        message: "User successfully registered"
      });
    } catch (err) {
      if (err.code === "ConditionalCheckFailedException") {
        return next(new AppError("Duplicate email", 409));
      }
      next(err);
    }
  } else {
    if (!email) {
      return next(new AppError("Email is required", 422));
    } else {
      return next(
        new AppError("Password and passwordConfirm did not match", 422)
      );
    }
  }
};

exports.login = async (req, res, next) => {
  const { email: requestEmail, password: requestPassword } = req.body;

  console.log(
    "requested email, ",
    requestEmail,
    "requested password",
    requestPassword
  );

  if (requestEmail && requestPassword) {
    try {
      const incorrectCredentialsError = new AppError(
        "Incorrect email or password",
        401
      );

      const user = await getUserInfoViaEmail(requestEmail);

      if (!user) {
        return next(incorrectCredentialsError);
      }
      const { password, email } = user;

      const isCorrectPassword = await bcrypt.compare(requestPassword, password);

      if (!isCorrectPassword) {
        return next(incorrectCredentialsError);
      }

      createSendToken(email, 200, res);
    } catch (err) {
      next(err);
    }
  } else {
    return next(new AppError("Username or password not found", 404));
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in, Please log in to get access", 401)
    );
  }

  try {
    const decodedInfo = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const { email } = decodedInfo;

    const user = await getUserInfoViaEmail(email);

    if (!user) {
      return next(
        new AppError("The token belonging to this user does no longer exists.")
      );
    }

    req.user = user.email;
    next();
  } catch (e) {
    return next(e);
  }
};

const getUserInfoViaEmail = async (user_email) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: tableName,
    Key: {
      email: user_email
    }
  };
  const data = await docClient.get(params).promise();
  const {
    Item: { email, password }
  } = data;
  return { email, password };
};
