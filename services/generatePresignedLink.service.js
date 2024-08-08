const { generatePresignedUrl } = require('../utils/localFileUtils');

exports.getPresignedLink = async (fileUrl) => {
    if (!fileUrl) {
        throw new Error('File URL is required');
    }

    try {
        const result = await generatePresignedUrl(fileUrl);
        return result;
    } catch (error) {
        console.error('Error in service generating presigned link:', error);
        throw error;
    }
};
