const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileUploadController = require('../controllers/fileupload.controller');

// Ensure uploads directory exists
const uploadDir = './uploads/';
if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir,{recursive:true});
}

const storage = multer.memoryStorage()
  
const upload = multer({ storage: storage });
  
  // Route to handle file upload
  router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res, next) => {
    console.log('Files uploaded:', req.files);
    fileUploadController.uploadFile(req, res, next);
  });

  module.exports = router;