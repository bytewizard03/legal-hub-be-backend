const fileUploadService = require('../services/fileupload.service');

exports.uploadFile = async (req, res) => {
    try {
      console.log('req.body:', req.body);
      console.log('req.files:', req.files);
      const { docFileType, reviewerName } = req.body; 
      const rId = Math.floor(Math.random() * 1000) + 1;
  
      // check if files are uploaded correctly
      const uploadedFile = req.files?.['file']?.[0];
      const uploadedImage = req.files?.['image']?.[0];

      if(!uploadedFile || !uploadedImage){
        return res.status(400).json({ error: 'Both file and image are required' });
      }
  
      // Call service to handle the file upload and processing
      const response = await fileUploadService.handleFileUpload({
        file: uploadedFile,
        image: uploadedImage,
        docFileType,
        reviewerName,
        rId
      });
  
      res.json(response);
    } catch (error) {
      console.log("okay" , error);
      //console.error('Error handling file upload:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };