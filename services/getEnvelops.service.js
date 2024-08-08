// server/services/getEnvelops.service.js
const { getAgreements, dynamoUpdateAgreement } = require('../utils/dynamoUtils');
const { checkEnvelopeStatus } = require('../utils/docuSign');

exports.handleGetEnvelops = async ({ page, pageSize }) => {
  try {
    const startIndex = (page - 1) * pageSize;
    const items = await getAgreements();

    // Sort and paginate items
    const sortedItems = items.sort((a, b) => new Date(b.dateOfAgreement) - new Date(a.dateOfAgreement));
    const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

    // Calculate counts
    let totalAgreement = items.length;
    let expiringNextMonth = 0;
    let reviewalCount = 0;

    items.forEach(item => {
      if (item.dayLeftToExpire && item.dayLeftToExpire <= 30) {
        expiringNextMonth++;
      }
      if (item.envelopeStatus === 'sent') {
        reviewalCount++;
      }
    });

    // Update envelope status
    await updateEnvelopeStatus(paginatedItems);

    return {
      envelops: paginatedItems,
      counts: {
        totalAgreement: totalAgreement,
        expiringNextMonth: expiringNextMonth,
        reviewalCount: reviewalCount
      }
    };
  } catch (error) {
    console.error('Error handling get envelopes service:', error);
    throw error;
  }
};

const updateEnvelopeStatus = async (envelopes) => {
  for (const envelope of envelopes) {
    try {
      if (envelope.rId && envelope.envelopeStatus === 'sent') {
        const status = await checkEnvelopeStatus(process.env.ACCOUNT_ID, envelope.envelopeId);
        await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
      } else if (envelope.rId) {
        const status = await checkEnvelopeStatus(process.env.ACCOUNT_ID, envelope.envelopeId);
        await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
      }
    } catch (error) {
      console.error(`Unexpected error updating envelope status: ${error}`);
    }
  }
};
