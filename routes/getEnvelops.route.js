const express = require('express');
const router = express.Router();
const getEnvelopsController = require('../controllers/getEnvelops.controller');

router.get('/get-envelops', getEnvelopsController.getEnvelops);

module.exports = router;
