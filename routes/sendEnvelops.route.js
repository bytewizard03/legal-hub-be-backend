const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEnvelopsController = require('../controllers/sendEnvelops.controller');

// Ensure uploads directory exists
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post('/send-envelops', upload.single('file'), (req, res, next) => {
  console.log('Files uploaded:', req.file);
  sendEnvelopsController.sendEnvelop(req, res, next);
});

module.exports = router;