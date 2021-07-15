const AWS = require("aws-sdk");
const AppError = require("../utils/AppError");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tableName = "User";

const signToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.email);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
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
      const response = await docClient.put(params).promise();
      console.log("reponse after saving user ", response);
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
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: tableName,
      Key: {
        email: requestEmail
      }
    };
    try {
      const data = await docClient.get(params).promise();
      const { Item } = data;

      const incorrectCredentialsError = new AppError(
        "Incorrect email or password",
        401
      );

      if (!Item) {
        return next(incorrectCredentialsError);
      }
      const { password } = Item;

      const isCorrectPassword = await bcrypt.compare(requestPassword, password);

      if (!isCorrectPassword) {
        return next(incorrectCredentialsError);
      }

      const user = { ...Item };
      createSendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
  } else {
    return next(new AppError("Username or password not found", 404));
  }
};
