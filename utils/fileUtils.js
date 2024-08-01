const fs = require('fs');
const path = require('path');

// Define local file storage root directory
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

function localFileUpload(fileBuffer, folder, fileName) {
  return new Promise((resolve, reject) => {
    console.log('File Buffer:', fileBuffer);  // Log to verify file buffer
     // Ensure fileBuffer is valid
     if (!fileBuffer) {
      reject(new Error('No file buffer provided'));
      return;
    }
    
    const filePath = path.join(uploadDir, folder, fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    

    fs.writeFile(filePath, fileBuffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        reject(err);
        return;
      }

      resolve({
        filePath: filePath.replace(__dirname, ''),
        url: `http://localhost:8040/uploads/${folder}/${fileName}`
      });
    });
  });
}

function generateLocalFileUrl(filePath) {
  return `http://localhost:8040${filePath}`;
}

module.exports = { localFileUpload, generateLocalFileUrl };