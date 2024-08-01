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

// Route to handle sending envelopes
// app.post('/legal/api/send-envelops', upload.single('file'), async (req, res) => {
//     const isFile = !req.body.file_path;
//     let filePath = isFile ? req.file.path : req.body.file_path;

//     const name = req.body.name;
//     const email = req.body.email;
//     const subject = req.body.subject;

//     const fileUrl = await generatePresignedUrl(filePath, 'test', `${req.body.id}_final.docx`);

//     const validPeriod = parseInt(extractValidPeriod(filePath), 10);
//     const expiryDate = calcExpiryDate(validPeriod);

//     const filterVal = parseInt(req.body.id, 10);
//     const response = await sendEmailDoc(getBase64(filePath, isFile), generateIds(), email, subject, name, generateIds(), process.env.ACCOUNT_ID);

//     const data = {
//         finalLink: fileUrl,
//         email: email,
//         subject: subject,
//         validity: validPeriod,
//         expiryDate: expiryDate,
//         envelopeId: response.envelopeId,
//         rId: filterVal
//     };

//     await dynamoUpdateAgreement(filterVal, data);

//     if (!isFile) {
//         fs.unlinkSync(filePath);
//     }

//     res.json({ message: 'Envelopes sent successfully', response });
// });

// Use the get envelopes routes
app.use('/legal/api', getEnvelopsRoutes);

// Route to get envelopes with pagination
// app.get('/legal/api/get-envelops', async (req, res) => {
//     const page = parseInt(req.query.page || 1, 10);
//     const pageSize = parseInt(req.query.page_size || 10, 10);

//     const startIndex = (page - 1) * pageSize;
//     const items = await getAgreements();

//     const sortedItems = items.sort((a, b) => new Date(b.dateOfAgreement) - new Date(a.dateOfAgreement));
//     const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

//     let totalAgreement = items.length;
//     let expiringNextMonth = 0;
//     let reviewalCount = 0;

//     items.forEach(item => {
//         if (item.dayLeftToExpire && item.dayLeftToExpire <= 30) {
//             expiringNextMonth++;
//         }
//         if (item.envelopeStatus === 'sent') {
//             reviewalCount++;
//         }
//     });

//     updateEnvelopeStatus(paginatedItems);

//     res.json({
//         envelops: paginatedItems,
//         counts: {
//             totalAgreement: totalAgreement,
//             expiringNextMonth: expiringNextMonth,
//             reviewalCount: reviewalCount
//         }
//     });
// });

// const updateEnvelopeStatus = async (envelopes) => {
//     for (const envelope of envelopes) {
//         try {
//             if (envelope.rId && envelope.envelopeStatus === 'sent') {
//                 const status = await checkEnvelopeStatus(process.env.ACCOUNT_ID, envelope.envelopeId);
//                 await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
//             } else if (envelope.rId) {
//                 const status = await checkEnvelopeStatus(process.env.ACCOUNT_ID, envelope.envelopeId);
//                 await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
//             }
//         } catch (error) {
//             console.error(`Unexpected error updating envelope status: ${error}`);
//         }
//     }
// };


// Use the generate presigned link route
app.use('/legal/api', generatePresignedLinkRoutes);

// // Route to generate presigned link
// app.post('/legal/api/generate-presigned-link', async (req, res) => {
//     const fileUrl = req.body.file_url;
//     const result = await generatePresignedUrl(fileUrl);

//     if (result) {
//         res.json({ presigned_link: result });
//     } else {
//         res.status(400).json({ message: 'Failed to generate presigned link' });
//     }
// });

app.use('/legal/api', notificationRoutes);

// Route to notify
// app.get('/legal/api/notify', async (req, res) => {
//     const result = await checkEnvelopes();
//     if (result) {
//         res.json({ message: result });
//     } else {
//         res.status(400).json({ message: 'Failed to send notification' });
//     }
// });

// Frontend routes
// app.get('/', (req, res) => {
//     res.redirect('/legal/ui/');
// });

// app.get('/legal/ui/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/index.html'));
// });

// app.get('/legal/ui/form/index.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/form/index.html'));
// });

// app.get('/legal/ui/form/final_page.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/form/final_page.html'));
// });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
