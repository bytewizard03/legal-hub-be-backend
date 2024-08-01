const { Document, Packer, Paragraph, TextRun } = require('docx');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
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

module.exports = {
  populateFile,
};