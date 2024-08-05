const fs = require('fs');
const path = require('path');

// Define local file storage root directory
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * Uploads a file buffer to local storage.
 * @param {Buffer} fileBuffer - The buffer of the file to save.
 * @param {string} folder - The folder to store the file in.
 * @param {string} fileName - The name to save the file as.
 * @returns {Promise<Object>} - Resolves with the file path and URL.
 */

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

/**
 * Generates a URL for a local file.
 * @param {string} filePath - The file path relative to the root directory.
 * @returns {string} - The URL to access the file.
 */

function generateLocalFileUrl(filePath) {
  //return `http://localhost:8040${filePath}`;
  // Ensure the filePath is correctly formatted
  const relativePath = path.relative(uploadDir, filePath);
  return `http://localhost:8040/uploads/${relativePath.replace(/\\/g, '/')}`;
}

module.exports = { localFileUpload, generateLocalFileUrl };