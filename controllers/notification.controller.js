const notificationService = require('../services/notification.service');

exports.sendNotification = async (req, res) => {
    try {
        const result = await notificationService.checkAndNotify();
        if (result) {
            res.json({ message: result });
        } else {
            res.status(400).json({ message: 'Failed to send notification' });
        }
    } catch (error) {
        console.error('Error in sendNotification controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
