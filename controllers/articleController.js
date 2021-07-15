const AWS = require("aws-sdk");
const { articleAttributes, articleKeySchema } = require("../models/Article");
const AppError = require("../utils/AppError");
const uuid = require("uuid");

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
    TableName: tableName,
    ProjectionExpression: "#id, #title, #content",
    ExpressionAttributeNames: {
      "#id": "id",
      "#title": "title",
      "#content": "content"
    }
  };

  try {
    const response = await dynamodb.scan(params).promise();
    console.log("all response ", response);
    const { Items, Count } = response;

    // Items.forEach((item) => {
    //   console.log(item.title.S);
    // });

    res.status(200).json({
      status: "success",
      results: Items,
      total_articles: Count
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.createArticle = async (req, res, next) => {
  const { title, content } = req.body;

  if (!title) {
    return next(new AppError("Please provide title for your article"));
  }

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: tableName,
    Item: {
      id: uuid.v4(),
      title,
      content,
      author: req.user
    }
  };

  try {
    await docClient.put(params).promise();
    return res.status(201).json({
      status: "success",
      message: "Article has been successfully created"
    });
  } catch (err) {
    next(err);
  }
};
