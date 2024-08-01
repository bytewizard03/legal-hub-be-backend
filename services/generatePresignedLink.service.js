const { generatePresignedUrl } = require('../utils/localFileUtils'); // Adjust the path if needed

exports.getPresignedLink = async (fileUrl) => {
    try {
        const result = await generatePresignedUrl(fileUrl);
        return result;
    } catch (error) {
        console.error('Error in service generating presigned link:', error);
        throw error;
    }
};
