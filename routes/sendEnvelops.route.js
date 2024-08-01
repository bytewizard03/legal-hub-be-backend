const express = require('express');
const router = express.Router();
const multer = require('multer');
const sendEnvelopsController = require('../controllers/sendEnvelops.controller');

// Configure multer storage (if needed)
const upload = multer({ dest: 'uploads/' });

router.post('/send-envelops', upload.single('file'), sendEnvelopsController.sendEnvelop);

module.exports = router;
