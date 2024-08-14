const dynamoose = require('dynamoose');
const AWS = require('aws-sdk');
require('dotenv').config();

// Configure DynamoDB
dynamoose.aws.ddb.local('http://localhost:8000');

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

/**
 * Inserts an agreement into DynamoDB.
 * @param {Object} data - The agreement data to insert.
 */
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

/**
 * Retrieves agreements from DynamoDB with pagination.
 * @param {number} startIndex - The start index for pagination.
 * @param {number} pageSize - The number of items to retrieve.
 * @returns {Promise<Array>} - A promise that resolves to the list of agreements.
 */
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

/**
 * Retrieves the count of agreements in DynamoDB.
 * @returns {Promise<number>} - A promise that resolves to the count of agreements.
 */
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

/**
 * Scans DynamoDB with a filter expression.
 * @param {string} attributeName - The attribute name to filter by.
 * @param {string} value - The value to search for.
 * @returns {Promise<Array>} - A promise that resolves to the list of filtered items.
 */
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

/**
 * Updates an agreement in DynamoDB.
 * @param {string} agreementId - The ID of the agreement to update.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} - A promise that resolves to the updated attributes.
 */
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

/**
 * Retrieves agreements from DynamoDB.
 * @returns {Promise<Array>} - A promise that resolves to the list of agreements.
 */
async function getAgreements(envelopeStatus,docName,searchTerm, dateOfAgreement, expiryDate) {
  try {
     // Build the FilterExpression and ExpressionAttributeNames/Values dynamically
     let filterExpression = '';
     const expressionAttributeNames = {};
     const expressionAttributeValues = {};
 
     if (envelopeStatus) {
       filterExpression += '#envelopeStatus = :envelopeStatus';
       expressionAttributeNames['#envelopeStatus'] = 'envelopeStatus';
       expressionAttributeValues[':envelopeStatus'] = envelopeStatus;
     }
 
     if (docName) {
       if (filterExpression) filterExpression += ' AND ';
       filterExpression += '#docName = :docName';
       expressionAttributeNames['#docName'] = 'doc_file_type';
       expressionAttributeValues[':docName'] = docName;
     }

     if (searchTerm) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '(contains(#docFileName, :searchTerm) OR contains(#nameField, :searchTerm) OR contains(#cinField, :searchTerm) OR contains(#emailField, :searchTerm) OR contains(#UserNameField, :searchTerm))';
      expressionAttributeNames['#docFileName'] = 'doc_name'; // Use field to search in
      expressionAttributeNames['#nameField'] = 'reviewer_name';
      expressionAttributeNames['#cinField'] = 'cin';
      expressionAttributeNames['#emailField'] = 'email';
      expressionAttributeNames['#UserNameField'] = 'registered_entity_name';
      expressionAttributeValues[':searchTerm'] = searchTerm;
    }

    // if (dateOfAgreement) {
    //   if (filterExpression) filterExpression += ' AND ';
    //   filterExpression += '#dateOfAgreement = :dateOfAgreement';
    //   expressionAttributeNames['#dateOfAgreement'] = 'date_of_agreement';
    //   expressionAttributeValues[':dateOfAgreement'] = dateOfAgreement;
    // }
    if (dateOfAgreement) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#dateOfAgreement <= :dateOfAgreement';
      expressionAttributeNames['#dateOfAgreement'] = 'date_of_agreement';
      // Truncate time part by taking only the date part if it's in the format 'YYYY-MM-DDTHH:MM:SS.sssZ'
      expressionAttributeValues[':dateOfAgreement'] = dateOfAgreement.split('T')[0]; 
    }

    if (expiryDate) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#expiryDate = :expiryDate';
      expressionAttributeNames['#expiryDate'] = 'expiryDate';
      expressionAttributeValues[':expiryDate'] = expiryDate;
    }
 
     const params = {
       TableName: tableName, 
       FilterExpression: filterExpression || undefined,
       ExpressionAttributeNames: Object.keys(expressionAttributeNames).length ? expressionAttributeNames : undefined,
       ExpressionAttributeValues: Object.keys(expressionAttributeValues).length ? expressionAttributeValues : undefined,
     };
    const response = await dynamodb.scan(params).promise();
    // if (response.Items) {
    //   console.log("Agreements retrieved:", response.Items);
    // } else {
    //   console.log("No items found in the 'Agreement' table.");
    // }
    return response.Items || [];
  } catch (error) {
    console.error(`Error retrieving agreements: ${error}`);
    throw new Error('Failed to retrieve agreements');
  }
}

module.exports = {
  dynamoInsertAgreement,
  dynamoGetAgreement,
  dynamoGetAgreementCount,
  scanWithFilter,
  dynamoUpdateAgreement,
  getAgreements, // Ensure this is included
};