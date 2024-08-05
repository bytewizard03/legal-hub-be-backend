// utils/envelopeUtils.js

const { checkEnvelopeStatus, dynamoUpdateAgreement } = require('./dynamoUtils'); // Import necessary functions from your utils

// This function checks the status of envelopes and updates the database accordingly
async function checkEnvelopes() {
    // Your logic for checking envelopes
    try {
        // Assume `getAgreements` returns a list of agreements that need to be checked
        const envelopes = await getAgreements(); 

        for (const envelope of envelopes) {
            if (envelope.rId) {
                const status = await checkEnvelopeStatus(process.env.ACCOUNT_ID, envelope.envelopeId);
                await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
            }
        }
        
        return 'Notification sent successfully'; // or return a more detailed message
    } catch (error) {
        console.error('Error checking envelopes:', error);
        throw new Error('Failed to check envelopes');
    }
}

module.exports = { checkEnvelopes };