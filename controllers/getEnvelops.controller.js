// server/controllers/getEnvelops.controller.js
const getEnvelopsService = require('../services/getEnvelops.service');

exports.getEnvelops = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const pageSize = parseInt(req.query.page_size || 10, 10);

    const response = await getEnvelopsService.handleGetEnvelops({ page, pageSize });

    res.json(response);
  } catch (error) {
    console.error('Error getting envelopes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
