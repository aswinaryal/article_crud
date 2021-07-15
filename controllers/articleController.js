const AWS = require("aws-sdk");
const redis = require("redis");

const { articleAttributes, articleKeySchema } = require("../models/Article");
const AppError = require("../utils/AppError");
const uuid = require("uuid");
const redis = require("redis");
const { promisify } = require("util");

const tableName = "Article";

const redis_client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const GET_ASYNC = promisify(redis_client.get).bind(redis_client);
const SET_ASYNC = promisify(redis_client.set).bind(redis_client);

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
  const cached_articles_data = await GET_ASYNC("articles");
  const cached_articles = JSON.parse(cached_articles_data);
  if (cached_articles) {
    console.log("using cached data -->> ", cached_articles);
    // res.status(200).json({
    //   status: "success",
    //   results: Items,
    //   total_articles: Count
    // });

    return;
  }

  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: tableName,
    ProjectionExpression: "#id, #title, #content, #author",
    ExpressionAttributeNames: {
      "#id": "id",
      "#title": "title",
      "#content": "content",
      "#author": "author"
    }
  };

  try {
    const response = await dynamodb.scan(params).promise();
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

  const article_new = {
    id: uuid.v4(),
    title,
    content,
    author: req.user
  };

  const params = {
    TableName: tableName,
    Item: article_new
  };

  try {
    await docClient.put(params).promise();
    return res.status(201).json({
      message: "article has been successfully created",
      data: { article_new }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateArticleById = async (req, res, next) => {
  const { title, content } = req.body;
  if (!title) {
    return next(new AppError("Please provide title for your article"));
  }

  const article_id = req.params.id;
  const userEmail = req.user;

  try {
    const article = await getUserArticleById(article_id, userEmail);

    if (!article || Object.keys(article).length === 0) {
      return next(
        new AppError("No any article associated with the given id", 404)
      );
    }

    if (!(article.author === userEmail)) {
      return next(new AppError("You cannot update this article", 401));
    }

    const docClient = new AWS.DynamoDB.DocumentClient();
    const article_updated = {
      id: article_id,
      title,
      content,
      author: userEmail
    };

    const params = {
      TableName: tableName,
      Item: article_updated
    };

    await docClient.put(params).promise();
    res.status(200).json({
      status: "article has been successfully updated",
      data: { article_updated }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticle = async (req, res, next) => {
  const article_id = req.params.id;
  const userEmail = req.user;

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: tableName,
    Key: {
      id: article_id
    }
  };

  try {
    const article = await getUserArticleById(article_id, userEmail);

    if (!article || Object.keys(article).length === 0) {
      return next(
        new AppError("No any article associated with the given id", 404)
      );
    }

    if (!(article.author === userEmail)) {
      return next(new AppError("You cannot delete this article", 401));
    }

    await docClient.delete(params).promise();

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (err) {
    next(err);
  }
};

const getUserArticleById = async (id) => {
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: tableName,
    Key: {
      id
    }
  };
  const data = await docClient.get(params).promise();
  const { Item } = data;
  return Item;
};
