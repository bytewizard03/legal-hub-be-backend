const { Document, Packer, Paragraph, TextRun } = require('docx');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { addMonths, format } = require('date-fns');
const { localFileUpload } = require('../utils/fileUtils');

async function populateFile(file, docFileType, image, rId) {
  // Define DOCX templates based on docFileType
  let docFileName;
  switch (docFileType) {
    case 'no_liability':
      docFileName = 'no_liability.docx';
      break;
    case 'institute_isa':
      docFileName = 'institute_isa.docx';
      break;
    case 'digital_partner':
      docFileName = 'digital_partner.docx';
      break;
    default:
      throw new Error('Invalid document file type');
  }

  // Resolve path for the DOCX template
  const docPath = path.resolve(__dirname , '../', docFileName);
  
  // Ensure the template file exists
  if (!fs.existsSync(docPath)) {
    throw new Error(`Template file not found at path: ${docPath}`);
  }

  // Paths for image
  const imagePath = image.path; // Path to the uploaded image

  // Use the buffer directly for the Excel file
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  const sheet = workbook.worksheets[0];
  const emailObj = sheet.getCell('D13').value;
  
  const email = typeof emailObj === 'object' && emailObj.text ? emailObj.text : emailObj;

  if (typeof email !== 'string') {
    console.log('Unexpected email value:', email);
    throw new Error('Email value is not a string');
  }

  // Read the DOCX template
  const docBuffer = fs.readFileSync(docPath);

  // Prepare data for document
  const today = new Date();
  const day = format(today, 'dd');
  const month = format(today, 'MMMM');
  const year = format(today, 'yyyy');

  const data = {
    '[day]': day,
    '[month]': month,
    '[year]': year,
    '[registered_entity_name]': sheet.getCell('D3').value,
    '[Institute_Address]': sheet.getCell('D12').value,
    '[CIN]': sheet.getCell('D5').value,
    '[Institute_telephone_number]': sheet.getCell('D14').value,
    '[Institute_email_id]': sheet.getCell('D13').value,
    '[contact_person_name]': sheet.getCell('D19').value,
    '[contact_person_designation]': sheet.getCell('D20').value,
    '[Name_from_mail_id]': extractNameFromEmail(email),
    '[product_snapshot]': imagePath // Update with actual image URL if needed
  };

  // Fill the document with data
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(data['[registered_entity_name]']),
              new TextRun('\n'),
              new TextRun(data['[Institute_Address]']),
              // Add more data as needed
            ],
          }),
        ],
      },
    ],
  });
  

  const filledBuffer = await Packer.toBuffer(doc); // Convert filled document to buffer

  // Save filled document locally
  const filledDocumentPath = path.join(__dirname, '../uploads', `${rId}_filled_document.docx`);
  fs.writeFileSync(filledDocumentPath, filledBuffer);

  // Save image locally (if required)
  const uploadedImage = await localFileUpload(image.buffer, 'images', `${rId}_uploaded_image.png`);

  return {
    filledDocumentPath: filledDocumentPath, // Path to the saved document
    data: data, // Data used for document processing
    tempFilePath: filledDocumentPath, // Path for temporary file
    image_url: uploadedImage.url // URL to the saved image
  };
}

function extractNameFromEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Invalid email format'); // Ensure email is a string
  }

  const namePart = email.split('@')[0];
  const name = namePart.replace(/\./g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return name;
}

function extractValidPeriod(docPath) {
  if (!docPath) {
    throw new Error('Document path is not provided');
}
let docBuffer;
    if (Buffer.isBuffer(docPath)) {
        docBuffer = docPath; // If docPath is a buffer
    } else {
      try {
        docBuffer = fs.readFileSync(docPath); // If docPath is a file path
    } catch (err) {
        throw new Error('Failed to read the document file: ' + err.message);
    }
    }
  //const docBuffer = fs.readFileSync(docPath);
  const pattern = /\b(\d+)\s+months\b/i;
  const content = docBuffer.toString(); // Read content as string

    console.log('Document Content:', content); // Log content for debugging

    const match = pattern.exec(content);
    if (match) {
        const period = parseInt(match[1], 10);
        if (isNaN(period) || period <= 0) {
            throw new Error('Extracted validity period is not a valid number');
        }
        return period;
    }

    throw new Error('Validity period not found in the document');
//   const paragraphs = docBuffer.toString().split('\n');

//   for (const paragraph of paragraphs) {
//       const match = pattern.exec(paragraph);
//       if (match) {
//         return parseInt(match[1], 10); 
//       }
//   }
//   return null;
 }

function calcExpiryDate(validPeriod) {
  if (isNaN(validPeriod) || validPeriod <= 0) {
    throw new Error('Invalid validity period');
}

const now = new Date();
const expiryDate = addMonths(now, validPeriod);
return format(expiryDate, 'yyyy-MM-dd');
}

module.exports = {
  populateFile,
  extractValidPeriod,
  calcExpiryDate,
};