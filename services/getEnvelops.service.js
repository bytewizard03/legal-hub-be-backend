const { getAgreements, dynamoUpdateAgreement } = require('../utils/dynamoUtils');
const { checkEnvelopeStatus } = require('../utils/docuSign');

exports.handleGetEnvelops = async ({ page, pageSize, envelopeStatus,docName,searchTerm, dateOfAgreement, expiryDate }) => {
  try {
    const startIndex = (page - 1) * pageSize;
    const items = await getAgreements(envelopeStatus,docName,searchTerm, dateOfAgreement, expiryDate);
    //console.log("Fetched items:", items); // Add this line

    // Sort and paginate items
    const sortedItems = items.sort((a, b) => new Date(b.dateOfAgreement) - new Date(a.dateOfAgreement));
    const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

    const now = new Date();

    // Calculate counts
    let totalAgreement = items.length;
    let expiringNextMonth = 0;
    let reviewalCount = 0;
    
    items.forEach(item => {
      const expiryDate = new Date(item.expiryDate);  // Make sure `expiryDate` is a valid date
      item.dayLeftToExpire = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      if (item.dayLeftToExpire && item.dayLeftToExpire <= 31) {
        expiringNextMonth++;
      }
     // console.log("item envelop status are:" ,item.envelopeStatus)
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
      console.log("envelope.rId is ", envelope.rId);
      console.log("envelop status is ", envelope.envelopeStatus);
      if (envelope.rId && envelope.envelopeStatus === 'sent') {
        const status = await checkEnvelopeStatus( envelope.envelopeId, process.env.ACCOUNT_ID);
        console.log("account id is ", process.env.ACCOUNT_ID);
        console.log("envelop id is ", envelope.envelopeId);
        await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
      } else if (envelope.rId) {
        const status = await checkEnvelopeStatus(envelope.envelopeId , process.env.ACCOUNT_ID);
        await dynamoUpdateAgreement(envelope.rId, { envelopeStatus: status.status });
      }
    } catch (error) {
      console.error(`Unexpected error updating envelope status: ${error}`);
    }
  }
};
