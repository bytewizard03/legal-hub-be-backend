const express = require('express');
const router = express.Router();
const generatePresignedLinkController = require('../controllers/generatePresignedLink.controller');

router.post('/generate-presigned-link', generatePresignedLinkController.generatePresignedLink);

module.exports = router;
