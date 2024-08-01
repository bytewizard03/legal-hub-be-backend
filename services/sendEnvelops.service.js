const fs = require('fs');
const { generatePresignedUrl } = require('../utils/fileUtils');
const { getBase64, sendEmailDoc, generateIds } = require('../utils/docuSign');
const { calcExpiryDate, extractValidPeriod } = require('../utils/populateFile');
const { dynamoUpdateAgreement } = require('../utils/dynamoUtils');

exports.handleSendEnvelop = async ({ fileData, name, email, subject, id, isFile }) => {
  try {
    const filePath = isFile ? fileData.path : fileData;

    // Generate presigned URL
    const fileUrl = await generatePresignedUrl(filePath, 'test', `${id}_final.docx`);

    // Extract validity period and calculate expiry date
    const validPeriod = parseInt(extractValidPeriod(filePath), 10);
    const expiryDate = calcExpiryDate(validPeriod);

    // Generate envelope ID and other details
    const filterVal = parseInt(id, 10);
    const envelopeId = generateIds();
    const response = await sendEmailDoc(getBase64(filePath, isFile), envelopeId, email, subject, name, generateIds(), process.env.ACCOUNT_ID);

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
    await dynamoUpdateAgreement(filterVal, data);

    // If file is temporary, delete it after processing
    if (!isFile) {
      fs.unlinkSync(filePath);
    }

    return { message: 'Envelopes sent successfully', response };
  } catch (error) {
    console.error('Error handling send envelope service:', error);
    throw error;
  }
};
