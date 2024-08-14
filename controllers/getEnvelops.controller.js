// server/controllers/getEnvelops.controller.js
const getEnvelopsService = require('../services/getEnvelops.service');

exports.getEnvelops = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const pageSize = parseInt(req.query.page_size || 20, 10);
    const envelopeStatus = req.query.envelope_status || '';
    const docName = req.query.doc_name || '';
    const searchTerm = req.query.search_term || '';
    const dateOfAgreement = req.query.date_of_agreement || '';
    const expiryDate = req.query.expiryDate || '';

    const response = await getEnvelopsService.handleGetEnvelops({ page, pageSize, envelopeStatus, docName, searchTerm, dateOfAgreement, expiryDate });

    res.json(response);
  } catch (error) {
    console.error('Error getting envelopes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
