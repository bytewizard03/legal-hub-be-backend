const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Route to notify
router.get('/notify', notificationController.sendNotification);

module.exports = router;
