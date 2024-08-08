const fs = require('fs');
const { localFileUpload, generateLocalFileUrl } = require('../utils/fileUtils');
const { convertToBase64, sendEmailDoc, generateIds } = require('../utils/docuSign');
const { calcExpiryDate, extractValidPeriod } = require('../utils/populateFile');
const dynamoose = require('dynamoose');

exports.handleSendEnvelop = async ({ fileData, name, email, subject, id, isFile }) => {
  let filePath;

  try {
    if (isFile) {
      if (!fileData || !fileData.path) {
          throw new Error('File data is invalid or file path is not available');
      }
      filePath = fileData.path; // This should be a string path
  } else {
      if (!fileData) {
          throw new Error('File path is not provided');
      }
      filePath = fileData; // This should be a string path
  }
    //filePath = isFile ? fileData.path : fileData;
    console.log('Resolved File Path:', filePath); // Log the resolved file path

    // Ensure filePath is valid
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File path is not provided or is invalid');
  }

    // Generate presigned URL
    //const fileUrl = await generatePresignedUrl(filePath, 'test', `${id}_final.docx`);
    const fileUrl = generateLocalFileUrl(filePath);

    // Extract validity period and calculate expiry date
    const validPeriod = parseInt(extractValidPeriod(filePath), 10);
    if (isNaN(validPeriod) || validPeriod <= 0) {
      throw new Error('Invalid validity period');
  }
    const expiryDate = calcExpiryDate(validPeriod);

    // Generate envelope ID and other details
    const filterVal = parseInt(id, 10);
    const envelopeId = generateIds();
    const base64File = await convertToBase64(filePath, isFile);
    const response = await sendEmailDoc(base64File, envelopeId, email, subject, name, generateIds(), process.env.ACCOUNT_ID);
    console.log("response is" ,response);

    const data = {
      finalLink: fileUrl,
      email,
      subject,
      validity: validPeriod,
      expiryDate,
      envelopeId: response.envelopeId,
      rId: filterVal,
    };

    // Update DynamoDB with envelope data
    console.log("envelope data parsed in dynamodb...........")
    const Agreement = dynamoose.model('Agreement', new dynamoose.Schema({
      id: {
        type: Number,
        hashKey: true, // This is the primary key
      },
      finalLink: String,
      email: String,
      subject: String,
      validity: Number,
      expiryDate: String,
      envelopeId: String,
      rId: Number,
    }));

    console.log("Data to be inserted:", data);
    if (!data.finalLink || !data.email || !data.subject || !data.validity || !data.expiryDate || !data.envelopeId || !data.rId) {
      throw new Error('One or more required fields are missing or invalid');
  }
  await Agreement.update({ id: filterVal }, data, { returnValues: 'UPDATED_NEW' });

    // If file is temporary, delete it after processing
    if (!isFile) {
      fs.unlinkSync(filePath);
    }

    return { message: 'Envelopes sent successfully', response };
  } catch (error) {
    console.error('Error handling send envelope service:', error);
    throw new Error('Failed to handle send envelope: ' + error.message);
  }
};