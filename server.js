const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fileUploadRoutes = require('./routes/fileupload.route');
const sendEnvelopsRoutes = require('./routes/sendEnvelops.route');
const getEnvelopsRoutes = require('./routes/getEnvelops.route');
const generatePresignedLinkRoutes = require('./routes/generatePresignedLink.route');
const notificationRoutes = require('./routes/notification.route');
const schedule = require('node-schedule');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8040;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Schedule a job to run daily at 9:00 AM
schedule.scheduleJob('0 9 * * *', () => {
    console.log('Running daily task at 9:00 am');
    checkEnvelopes();
});

// Health check endpoint
app.get('/legal/health', (req, res) => {
    res.json({ status: 'ok' });
});


// Serve static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the file upload routes
app.use('/legal/api', fileUploadRoutes);

// Use the send envelopes routes
app.use('/legal/api', sendEnvelopsRoutes);

// Use the get envelopes routes
app.use('/legal/api', getEnvelopsRoutes);

// Use the generate presigned link route
app.use('/legal/api', generatePresignedLinkRoutes);

// Route to notify
app.use('/legal/api', notificationRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
