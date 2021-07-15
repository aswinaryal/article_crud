const AWS = require("aws-sdk");
const { articleAttributes, articleKeySchema } = require("../models/Article");

const dynamodb = new AWS.DynamoDB();
const tableName = "Article";

exports.createArticleTable = async (req, res, next) => {
  const params = {
    TableName: tableName,
    KeySchema: [{ ...articleKeySchema }],
    AttributeDefinitions: [{ ...articleAttributes }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    res.status(200).json({
      status: "article table created successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticleTable = async (req, res, next) => {
  const params = {
    TableName: tableName
  };
  try {
    await dynamodb.deleteTable(params).promise();
    res.status(200).json({
      status: "article table deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};
