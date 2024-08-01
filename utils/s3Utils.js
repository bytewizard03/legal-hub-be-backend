const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
const credentials = {
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
};

AWS.config.update(credentials);

const s3 = new AWS.S3();
const bucketName = 'eduvanz-interns';

function awsFileUpload(file, folder, fileName = null, isFile = true) {
  return new Promise((resolve, reject) => {
    let fileStream;

    if (isFile) {
      fileStream = file; // Assuming file is a stream
    } else {
      fileStream = fs.createReadStream(file);
    }

    if (!fileName) {
      fileName = path.basename(file); // Extract filename from the file path if not provided
    }

    const filePath = `${folder}/${fileName}`;

    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: fileStream,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading file:', err);
        reject(err);
        return;
      }

      const urlParams = {
        Bucket: bucketName,
        Key: filePath,
        Expires: 3600,
      };

      s3.getSignedUrl('getObject', urlParams, (err, url) => {
        if (err) {
          console.error('Error generating presigned URL:', err);
          reject(err);
          return;
        }

        resolve({ filePath, url });
      });
    });
  });
}

function generatePresignedUrl(objectName, expiration = 3600) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: objectName,
      Expires: expiration,
    };

    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating presigned URL:', err);
        reject(err);
        return;
      }

      resolve(url);
    });
  });
}

module.exports = { awsFileUpload, generatePresignedUrl };
