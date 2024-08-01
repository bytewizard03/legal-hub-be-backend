const generatePresignedLinkService = require('../services/generatePresignedLink.service');

exports.generatePresignedLink = async (req, res) => {
    try {
        const fileUrl = req.body.file_url;
        const result = await generatePresignedLinkService.getPresignedLink(fileUrl);

        if (result) {
            res.json({ presigned_link: result });
        } else {
            res.status(400).json({ message: 'Failed to generate presigned link' });
        }
    } catch (error) {
        console.error('Error generating presigned link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
