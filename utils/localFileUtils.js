const path = require('path');
const fs = require('fs');

const generatePresignedUrl = (fileUrl) => {
    return new Promise((resolve, reject) => {
        if (!fileUrl) {
            return reject('File URL is required');
        }

        try {
            // Resolve the absolute path of the file
            const absolutePath = path.resolve(fileUrl);

            // Check if the file exists
            fs.access(absolutePath, fs.constants.F_OK, (err) => {
                if (err) {
                    reject('File does not exist');
                } else {
                    // Simulating a presigned URL by just returning the absolute path for local testing
                    resolve(absolutePath);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePresignedUrl };
