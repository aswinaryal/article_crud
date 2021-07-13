const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const AWS = require("aws-sdk");

const app = express();

app.use(express.json());

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL
});

app.get("/api/v1/create-article-table", (req, res, next) => {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: "Articles",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10
    }
  };

  dynamodb.createTable(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to create table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(400).json({
        status: "Table creation failed",
        message: "Unable to create article table"
      });
    } else {
      console.log(
        "Created table. Table description JSON:",
        JSON.stringify(data, null, 2)
      );
      res.status(200).json({
        status: "Table creation success",
        message: "Article table created successfully"
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

app.get("/api/v1/status", (req, res, next) => {
  res.status(200).json({
    status: "OK"
  });
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
