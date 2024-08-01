const { checkEnvelopes } = require('../utils/envelopeUtils'); // Assuming this is where `checkEnvelopes` is defined

exports.checkAndNotify = async () => {
    try {
        const result = await checkEnvelopes();
        return result;
    } catch (error) {
        console.error('Error in checkAndNotify service:', error);
        throw error;
    }
};
