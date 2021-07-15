const AWS = require("aws-sdk");
const { userAttributes, userKeySchema } = require("../models/User");

const tableName = "User";

exports.createUserTable = async (req, res, next) => {
  const dynamodb = new AWS.DynamoDB();
  const params = {
    TableName: tableName,
    KeySchema: [{ ...userKeySchema }],
    AttributeDefinitions: [{ ...userAttributes }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  };

  try {
    const data = await dynamodb.createTable(params).promise();
    console.log(
      "Created table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
    res.status(200).json({
      status: "user table created successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserTable = async (req, res, next) => {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: tableName
  };
  try {
    await dynamodb.deleteTable(params).promise();
    res.status(200).json({
      status: "user table deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
