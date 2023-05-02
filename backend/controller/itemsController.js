const dotenv = require("dotenv");
dotenv.config();
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { use } = require("../routes/itemRoutes");

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });

// exports.getGroupMembers = async (req, res) => {
//   const params = {
//     TableName: process.env.aws_group_members_table_name,
//   };
//   try {
//     const data = await docClient.send(new ScanCommand(params));
//     res.send(data.Items);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// };

const tableName = "item_db_99"

// TODO #1.1: Get items from DynamoDB
exports.getItems = async (req, res) => {
  const user_id = req.params.user_id;
  // You should change the response below.
  const params = {
    TableName: tableName,
    FilterExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ':user_id': user_id
    }
  };
  try {
    const data = await docClient.send(new ScanCommand(params));
    res.send(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// TODO #1.2: Add an item to DynamoDB
exports.addItem = async (req, res) => {
  const user_id = req.params.user_id;
  const item_id = uuidv4();
  const item = { item_id: item_id, user_id: user_id, ...req.body };

  // You should change the response below.
  const putParams = {
    TableName: tableName,
    Item: item, // member object to be added
  }
  try {
    // use 'PutCommand' object to insert an item into the table
    await docClient.send(new PutCommand(putParams));
  }
  catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
  // You should change the response below.
  res.send(item_id);
};

// TODO #1.3: Delete an item from DynamDB
exports.deleteItem = async (req, res) => {
  const item_id = req.params.item_id
  const user_id = req.params.user_id
  console.log(item_id)
  const deleteParams = {
    TableName: tableName,
    Key: { "item_id": item_id, "user_id": user_id }
  }
  try {
    const response = await docClient.send(new DeleteCommand(deleteParams));
    console.log(response);
  } catch (err) {
    console.error(err)
    res.status(500).send(err);
  }
  // You should change the response below.
  res.send(`deleted item with id: ${item_id}`);
};

exports.updateItem = async (req, res) => {
  const item_id = req.params.item_id;
  const user_id = req.params.user_id

  const title = req.body["title"]
  const desc = req.body["desc"]
  const date = req.body["date"]
  const params = {
    TableName: tableName,
    Key: { "item_id": item_id, "user_id": user_id },
    UpdateExpression: "set #a = :a, #b = :b, #c=:c",
    ExpressionAttributeNames: { "#a": "title", "#b": "desc", "#c": "date" },
    ExpressionAttributeValues: {
      ":a": title,
      ":b": desc,
      ":c": date
    }
  }
  try {
    const response = await docClient.send(new UpdateCommand(params));
    console.log(response);
  } catch (err) {
    console.error(err)
    res.status(500).send(err);
  }
  res.send(`Updated item id ${item_id}`)
};
