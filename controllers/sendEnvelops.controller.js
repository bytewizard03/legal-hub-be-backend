const sendEnvelopsService = require('../services/sendEnvelops.service');

exports.sendEnvelop = async (req, res) => {
  try {
    const { file, name, email, subject, id, file_path } = req.body;
    const isFile = !file_path;
    const fileData = isFile ? req.file : file_path;

    const response = await sendEnvelopsService.handleSendEnvelop({ fileData, name, email, subject, id, isFile });

    res.json(response);
  } catch (error) {
    console.error('Error sending envelopes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
