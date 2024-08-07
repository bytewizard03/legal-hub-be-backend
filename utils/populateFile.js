const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const { addMonths, format } = require("date-fns");
const { localFileUpload } = require("../utils/fileUtils");

async function populateFile(file, docFileType, image, rId) {
  // Define DOCX templates based on docFileType
  let docFileName;
  switch (docFileType) {
    case "no_liability":
      docFileName = "no_liability.docx";
      break;
    case "institute_isa":
      docFileName = "institute_isa.docx";
      break;
    case "digital_partner":
      docFileName = "digital_partner.docx";
      break;
    default:
      throw new Error("Invalid document file type");
  }

  // Resolve path for the DOCX template
  const docPath = path.resolve(__dirname, "../", docFileName);

  // Ensure the template file exists
  if (!fs.existsSync(docPath)) {
    throw new Error(`Template file not found at path: ${docPath}`);
  }

  // Use the buffer directly for the Excel file
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  const sheet = workbook.worksheets[0];
  const emailObj = sheet.getCell("D13").value;
  const email = typeof emailObj === "object" && emailObj.text ? emailObj.text : emailObj;

  if (typeof email !== "string") {
    console.log("Unexpected email value:", email);
    throw new Error("Email value is not a string");
  }

  // Prepare data for document
  const today = new Date();
  const data = {
    day: format(today, "dd"),
    month: format(today, "MMMM"),
    year: format(today, "yyyy"),
    registered_entity_name: sheet.getCell("D3").value,
    Institute_Address: sheet.getCell("D12").value,
    CIN: sheet.getCell("D5").value,
    Institute_telephone_number: sheet.getCell("D14").value,
    Institute_email_id: sheet.getCell("D13").value,
    contact_person_name: sheet.getCell("D19").value,
    contact_person_designation: sheet.getCell("D20").value,
    Name_from_mail_id: extractNameFromEmail(email),
    //kyc_authorized_signatory: sheet.getCell("23").value,
    //product_snapshot:
    // Add more fields as needed
  };
  console.log(data);

  // Load the docx file as binary content
  const content = fs.readFileSync(
    path.resolve(__dirname, docPath),
    "binary"
  );

  // Unzip the content of the file
  const zip = new PizZip(content);

  // This will parse the template and replace placeholders
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Render the document with the data
  try {
    doc.render(data);
  } catch (error) {
    console.error("Error rendering document:", error);
    throw new Error("Error rendering document with provided data");
  }

  // Get the zip document and generate it as a nodebuffer
  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  // Save filled document locally
  const filledDocumentPath = path.join(
    __dirname,
    "../uploads",
    `${rId}_filled_document.docx`
  );
  fs.writeFileSync(filledDocumentPath, buf);

  // Optionally save the image locally if needed
  let image_url = null;
  if (image && image.buffer) {
    try {
      const uploadedImage = await localFileUpload(image.buffer, "images", `${rId}_uploaded_image.png`);
      image_url = uploadedImage.url;
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw new Error("Error uploading image");
    }
  }

  return {
    filledDocumentPath, // Path to the saved document
    data, // Data used for document processing
    tempFilePath: filledDocumentPath, // Path for temporary file
    //image_url: uploadedImage.url, // URL to the saved image
    image_url, // URL to the saved image, or null if no image
  };
}

function extractNameFromEmail(email) {
  if (typeof email !== "string") {
    throw new Error("Invalid email format");
  }

  const namePart = email.split("@")[0];
  const name = namePart.replace(/\./g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return name;
}

function extractValidPeriod(docPath) {
  if (!docPath) {
    throw new Error("Document path is not provided");
  }

  let docBuffer;
  if (Buffer.isBuffer(docPath)) {
    docBuffer = docPath; // If docPath is a buffer
  } else {
    try {
      docBuffer = fs.readFileSync(docPath); // If docPath is a file path
    } catch (err) {
      throw new Error("Failed to read the document file: " + err.message);
    }
  }

  const pattern = /\b(\d+)\s+months\b/i;
  const content = docBuffer.toString(); // Read content as string
  // Use PizZip to unzip the DOCX content
  const zip = new PizZip(docBuffer);

  // Extract and modify document.xml
  const docXml = zip.file("word/document.xml")?.asText();
  //console.log("document content: ",docXml);
  
  if (!docXml) {
    throw new Error("document.xml not found in the DOCX archive");
  }

 // console.log("Document Content:", content); // Log content for debugging

 // const match = pattern.exec(content);
 const match  = pattern.exec(docXml);
  if (match) {
    const period = parseInt(match[1], 10);
    if (isNaN(period) || period <= 0) {
      throw new Error("Extracted validity period is not a valid number");
    }
    return period;
  }

  throw new Error("Validity period not found in the document");
}

function calcExpiryDate(validPeriod) {
  if (isNaN(validPeriod) || validPeriod <= 0) {
    throw new Error("Invalid validity period");
  }

  const now = new Date();
  const expiryDate = addMonths(now, validPeriod);
  return format(expiryDate, "yyyy-MM-dd");
}

module.exports = {
  populateFile,
  extractValidPeriod,
  calcExpiryDate,
};