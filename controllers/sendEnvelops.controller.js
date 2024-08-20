const sendEnvelopsService = require('../services/sendEnvelops.service');
const {extractValidPeriod } = require('../utils/populateFile');

exports.sendEnvelop = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { name, email, subject, id, correct_file} = req.body;
    const filePath = req.file?.path;

    if (!name || !email || !subject || !id) {
      throw new Error('Missing required fields');
    }

    if (!filePath) {
      throw new Error('File path is not provided');
   }
    console.log('File Path:', filePath); // Log filePath to verify its value
    const isFile = !correct_file;
    const fileData = isFile ? req.file : filePath;

     //Ensure fileData is not undefined
     if (!fileData) {
      throw new Error('File data is not provided');
  }

    // Ensure validPeriod is being properly extracted
    const validPeriod = parseInt(extractValidPeriod(filePath), 10);
    if (validPeriod === null || isNaN(validPeriod) || validPeriod <= 0) {
      validPeriod = 3;
      //throw new Error('Validity period not found or invalid in the document');
    }
    console.log('Extracted Valid Period:', validPeriod);

    const response = await sendEnvelopsService.handleSendEnvelop({
      fileData,
      name,
      email,
      subject,
      id,
      isFile,
    });

    res.json(response);
  } catch (error) {
    console.error('Error sending envelopes:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
