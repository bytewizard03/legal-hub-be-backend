const { localFileUpload, generateLocalFileUrl } = require('../utils/fileUtils');
const { populateFile,extractValidPeriod,calcExpiryDate } = require('../utils/populateFile');
const dynamoose = require('dynamoose');
//const validFileTypes = ['no_liability', 'institute_isa', 'digital_partner']; // Valid types

exports.handleFileUpload = async ({ file, image, docFileType, reviewerName, rId }) => {
  let docName;

  try {
    // Validate inputs
    if (!file || !file.buffer) throw new Error('File buffer is missing');
    if (!image || !image.buffer) throw new Error('Image buffer is missing');

    // Validate docFileType
    // if (!validFileTypes.includes(docFileType)) {
    //   throw new Error('Invalid document file type');
    // }
    console.log('Received file type:', docFileType);
    console.log('Received reviewer name:', reviewerName);
    console.log('Recieved Id', rId);
    console.log('Received file:', file);
    console.log('Received image:', image);


    // Determine document name based on type
    console.log("docfiletype is ",docFileType);
    switch (docFileType) {
      case 'no_liability':
        docName = 'No liability agreement';
        break;
      case 'institute_isa':
        docName = 'Institute ISA agreement';
        break;
      case 'digital_partner':
        docName = 'Digital Partner agreement';
        break;
      default:
        throw new Error('Invalid document file type');
    }

    // Upload file and image to local storage
    console.log(`Uploading file and image for rId: ${rId}`);
    const uploadedFile = await localFileUpload(file.buffer, 'files', `${rId}_uploaded.csv`);
    const uploadedImage = await localFileUpload(image.buffer, 'images', `${rId}_uploaded_image.png`);

    // Process files with populateFile
    console.log('Processing files...');
    const { filledDocumentPath, data, tempFilePath, image_url } = await populateFile(
      file,
      docFileType,
      image,
      rId
    );

    // Insert data into DynamoDB
    console.log('Inserting data into DynamoDB...');
    const Agreement = dynamoose.model('Agreement', {
      id: Number,
      registered_entity_name: String,
      cin: String,
      uploaded_file: String,
      temp_file_path: String,
      final_link: String,
      date_of_agreement: String,
      doc_name: String,
      doc_file_type: String,
      reviewer_name: String,
    });

    await Agreement.create({
      id: rId,
      registered_entity_name: data['[registered_entity_name]'],
      cin: data['[CIN]'],
      uploaded_file: uploadedFile.filePath,
      temp_file_path: tempFilePath,
      final_link: filledDocumentPath,
      date_of_agreement: new Date().toISOString(),
      doc_name: docName,
      doc_file_type: docFileType,
      reviewer_name: reviewerName,
    });

    console.log(`Data successfully inserted for rId: ${rId}`);
    return {
      filled_document_path: filledDocumentPath,
      id: String(rId),
      temp_file_path: tempFilePath,
      name: data['[registered_entity_name]'],
      uploaded_file: uploadedFile.filePath,
      //image_url: image_url,
      image_url: uploadedImage.filePath, 
    };
  } catch (error) {
    console.log("Error:", error);
    throw new Error('File upload and processing failed');
  }
};