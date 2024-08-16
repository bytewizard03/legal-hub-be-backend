const path = require('path');
const fs = require('fs');

const generatePresignedUrl = (fileUrl) => {
    return new Promise((resolve, reject) => {
        if (!fileUrl) {
            return reject('File URL is required');
        }

        try {
            // Convert Windows path to Unix path for compatibility
            const unixFileUrl = fileUrl.replace(/\\/g, '/');
            
            // Resolve the absolute path of the file
            const absolutePath = path.resolve(unixFileUrl);

            // Check if the file exists
            fs.access(absolutePath, fs.constants.F_OK, (err) => {
                if (err) {
                    reject('File does not exist');
                } else {
                    // Generate a URL that can be used to access the file
                    const relativePath = path.relative(path.resolve(__dirname, '..', 'uploads'), absolutePath);
                    const baseUrl = 'http://localhost:8040'; // Adjust to server's URL
                    const fileAccessUrl = `${baseUrl}/uploads/${relativePath}`;

                    resolve(fileAccessUrl);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePresignedUrl };


