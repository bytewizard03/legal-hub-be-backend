const generatePresignedLinkService = require('../services/generatePresignedLink.service');

exports.generatePresignedLink = async (req, res) => {
    try {
        const fileUrl = req.body.file_url;
        if (!fileUrl) {
            return res.status(400).json({ message: 'File URL is required' });
        }

        const result = await generatePresignedLinkService.getPresignedLink(fileUrl);

        res.json({ presigned_link: result });
    } catch (error) {
        console.error('Error generating presigned link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
