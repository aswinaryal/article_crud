const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL
});

const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: "Articles",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }, //Partition key
    { AttributeName: "title", KeyType: "S" }, //Sort key
    { AttributeName: "content", KeyType: "S" }
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "title", AttributeType: "S" },
    { AttributeName: "content", AttributeType: "S" }
  ],
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
  } else {
    console.log(
      "Created table. Table description JSON:",
      JSON.stringify(data, null, 2)
    );
  }
});
