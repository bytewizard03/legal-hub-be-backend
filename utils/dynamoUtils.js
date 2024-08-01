const dynamoose = require('dynamoose');
const AWS = require('aws-sdk');
//const credentials = require('../envaws').credentials;
require('dotenv').config();
dynamoose.aws.ddb.local('http://localhost:8000');

// const accessKeyId = credentials.accessKeyId;
// const secretAccessKey = credentials.secretAccessKey;
// const region = credentials.region;
// const endpoint = credentials.endpoint;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const endpoint = process.env.AWS_DYNAMODB_ENDPOINT;

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
  endpoint,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'legal-docs'; // Ensure this matches the table in your local DynamoDB

async function dynamoInsertAgreement(data) {
  const params = {
    TableName: tableName,
    Item: data,
  };

  try {
    await dynamodb.put(params).promise();
    console.log('Item inserted successfully');
  } catch (error) {
    console.error(`Error inserting item: ${error}`);
    throw new Error('Failed to insert item');
  }
}

async function dynamoGetAgreement(startIndex, pageSize) {
  const params = {
    TableName: tableName,
  };

  try {
    const response = await dynamodb.scan(params).promise();
    const items = response.Items || [];

    // Perform pagination based on startIndex and pageSize
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);
    return paginatedItems;
  } catch (error) {
    console.error(`Error retrieving agreements: ${error}`);
    throw new Error('Failed to retrieve agreements');
  }

}

async function dynamoGetAgreementCount() {
  const params = {
    TableName: tableName,
  };

  try {
    const response = await dynamodb.scan(params).promise();
    return response.Items ? response.Items.length : 0;
  } catch (error) {
    console.error(`Error retrieving agreement count: ${error}`);
    throw new Error('Failed to retrieve agreement count');
  }

}

async function scanWithFilter(attributeName, value) {
  const params = {
    TableName: tableName,
    FilterExpression: `contains(${attributeName}, :value)`,
    ExpressionAttributeValues: {
      ':value': value,
    },
  };

  try {
    const response = await dynamodb.scan(params).promise();
    return response.Items || [];
  } catch (error) {
    console.error(`Error scanning DynamoDB: ${error}`);
    throw new Error('Failed to scan DynamoDB');
  }
}

async function dynamoUpdateAgreement(agreementId, data) {
  const updateExpression = Object.keys(data)
    .map((key) => `#${key} = :${key}`)
    .join(', ');

  const expressionAttributeNames = Object.keys(data).reduce((acc, key) => {
    acc[`#${key}`] = key;
    return acc;
  }, {});

  const expressionAttributeValues = Object.keys(data).reduce((acc, key) => {
    acc[`:${key}`] = data[key];
    return acc;
  }, {});

  const params = {
    TableName: tableName,
    Key: { id: agreementId },
    UpdateExpression: `SET ${updateExpression}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const response = await dynamodb.update(params).promise();
    return response.Attributes;
  } catch (error) {
    console.error(`Error updating agreement: ${error}`);
    throw new Error('Failed to update agreement');
  }

}

module.exports = {
  dynamoInsertAgreement,
  dynamoGetAgreement,
  dynamoGetAgreementCount,
  scanWithFilter,
  dynamoUpdateAgreement,
};