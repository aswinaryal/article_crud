const AWS = require("aws-sdk");
const { articleAttributes, articleKeySchema } = require("../models/Article");

const tableName = "Article";

exports.createArticleTable = async (req, res, next) => {
  const dynamodb = new AWS.DynamoDB();
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
  const dynamodb = new AWS.DynamoDB();
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

exports.getArticles = async (req, res, next) => {
  const dynamodb = new AWS.DynamoDB();
  const params = {
    TableName: tableName
  };

  try {
    const allArticles = await dynamodb.scan(params).promise();
    console.log("all articles => ", allArticles);
    res.status(200).json({
      status: "success",
      results: []
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
