const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const docusign = require('docusign-esign')

dotenv.config();

const base_url = process.env.BASE_PATH;
// const iss = process.env.ISS;
// const sub = process.env.SUB;

// Initialize local DynamoDB configuration
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "ap-south-1",
    endpoint: 'http://localhost:8000' // Local DynamoDB endpoint
});

// Your private key (replace this with your actual private key)
const private_key = `
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAiPPK+/VYQ+PTmNqviEKc2EYY5sWhK3pTSlXWCtsdL05BlOCV
fxwTuo/Yvudru34FS6dF8x+zUP5sfo1GPD7E2zwpHfsgDDJd+xOe9XSPI3iSigKz
foSTqmOOTMAvdjGPXmrIPRTrCVdrPmjNqUcwVkLTeTV2EW29hGeSz8dI4s2LlNB8
gw4RB3neoqUx5HVY5gUq2zY5jYjLmPzB8H+oaWYuG3DSyWfzVkmXWAanb0pzaAHF
i966UJCP4EPIia0jJkpeKARi4iVAFLcpNEB5/OMEuOEaBiF0G270fWTZquqXlPor
7S+wgEeVR6i1iskNt800IlX2TfbU2Z87/WmTMQIDAQABAoIBAAPy8bCzuaSVgnG3
JpYZg5/J36hx3OydxZ6QXJBqEoydZ081baIha2E3CiMxFZ5tqxXsIBx7VsaYW4UH
qlWM4szGjpH2fo1Te3nErlH6FzGI5cLUgpv8kyx32+/TH9s64R0yG42FV6SokGdX
isydiKOIIERvufSVM0CI4wcaQjwF8fBBxBfSPxCl+wT7rWqZmpWyCqXWrWvywNdg
wluAFgJyJ/HNDGLJY+BgEd+vvYI6zkOitSIPSkJOay8kMyqcGfadDQCjM/25Z8ud
P2Co+qzy5CF1xvKD1ifOnGNZBa+HG2xvat+3uwziB0biqt40FpS2Eqt4qWeq1a3X
LOKXLWUCgYEAzE+imy1cTkK/yAb+yK+pLaFW59QyLdFGNedxZanhvgewqGvmyAPf
40xKTZbp144NoQsY+JlHB7bKdNJBJ4z16ralj46hoEpcYDjkDcCPYxpqEjbCOLpQ
p2GKNX/3Yfp/FP2C4gnrgxcAh8tOcSDAVpiEjVJhO+LmMAvd9Y2QIuUCgYEAq5md
l/eZmGGgSvifNf7pm7MjMQ9wP85A636YTLIePGcsTu3A8urzbrqWKlMy7z6iQQOb
LNKQnDObb0YKtxgckwBA6vRBuPNf87xj7FsFrWYjUispsjcm98kQTmwD5lwEj7FC
nhixs1bpODzKvSIj+TlF0qn66KLHCbQR2Qts7l0CgYBsOUa+AiIiBnOGJkZx0bLA
y/S36owF/xO82/MSUhGU0of+PuHJU1wWD8RQIz+NAd8wTiuVC8Q3TtkhVnpS0/Uz
tjout/Pfb2RNR/VtX3HUohpLuZvZ5r9wWleWjUliKgmE+eCJkY2iK94JEGVlwV6A
wFt+bIO68C7UhoS1XJ5cDQKBgGCYzNnrC494BV+urREcOiznnnvTkQCZ/nmSffFO
oy6ldY/IzsDv+bDvX/DbfOSogXXPrd6Bed40Pt9Ysld3Pz6Q+fpJHWYbunveJPG8
G2oNAP0URxiHa2w4xvEeZOOcEQVCZ5nPlNi7p/V8YzQsr8tvrhp0jUW/vAN+Vj2z
7NIRAoGAKQjfj3aF5eudDso5QhKEbrA+1RnbGXyAaRW7LFAX0OREsRqCpWbilQw7
AyDzj43OxEiiCmo6AqD0qvJqsRJbAR3xgg8j+jB86tUBnbcgVku0/2mvc0qextor
TGn4lEc5X2aCItsQMqlaDEtLmNgtKJBVGZmeZG2KzgZ8trmFzNM=
-----END RSA PRIVATE KEY-----
`;

// Your public key (replace this with your actual public key)
const public_key = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiPPK+/VYQ+PTmNqviEKc
2EYY5sWhK3pTSlXWCtsdL05BlOCVfxwTuo/Yvudru34FS6dF8x+zUP5sfo1GPD7E
2zwpHfsgDDJd+xOe9XSPI3iSigKzfoSTqmOOTMAvdjGPXmrIPRTrCVdrPmjNqUcw
VkLTeTV2EW29hGeSz8dI4s2LlNB8gw4RB3neoqUx5HVY5gUq2zY5jYjLmPzB8H+o
aWYuG3DSyWfzVkmXWAanb0pzaAHFi966UJCP4EPIia0jJkpeKARi4iVAFLcpNEB5
/OMEuOEaBiF0G270fWTZquqXlPor7S+wgEeVR6i1iskNt800IlX2TfbU2Z87/WmT
MQIDAQAB
-----END PUBLIC KEY-----
`;


// Payload for the JWT
const payload = {
    iss: "a70056eb-ea16-49b1-887e-2afec9cf72f5",  // your integration key from DocuSign
    sub: "fcec2b47-17b6-4708-be29-63d6a8696218", // user id or subject
    aud: "account-d.docusign.com",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    scope: "signature impersonation"
};

// Generate the JWT token
const token = jwt.sign(payload, private_key, { algorithm: 'RS256' });

//console.log('Generated JWT Token:', token); // Log the token for debugging

const convertToBase64 = (filePath) => {
    try {
        // Read the file content
        const fileContent = fs.readFileSync(filePath);

        // Convert the file content to a base64 string
        const base64Data = Buffer.from(fileContent).toString('base64');
        
        return base64Data;
    } catch (error) {
        console.error('Error reading or converting file to base64:', error);
        throw error; // Re-throw or handle the error as needed
    }
};

const checkEnvelopeStatus = async (envelopeId, accountId = process.env.accountId) => {
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes/${envelopeId}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await axios.get(url, { headers });
    return response.data;
};

const generateIds = () => {
    return Math.floor(Math.random() * 90000) + 10000; // Generate a random 5-digit number
};

const generateToken = async () => {
    const url = 'https://account-d.docusign.com/oauth/token';

    const payload = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhNzAwNTZlYi1lYTE2LTQ5YjEtODg3ZS0yYWZlYzljZjcyZjUiLCJzdWIiOiJmY2VjMmI0Ny0xN2I2LTQ3MDgtYmUyOS02M2Q2YTg2OTYyMTgiLCJhdWQiOiJhY2NvdW50LWQuZG9jdXNpZ24uY29tIiwiaWF0IjoxNzIyOTM4MDgxLCJleHAiOjE3MjI5NDE2ODEsInNjb3BlIjoic2lnbmF0dXJlIGltcGVyc29uYXRpb24ifQ.E9-abxcumL2MHpTheppTADndlvQXMvu8omP8H6gTBxleP6YF-hy9ripd6f22GYHSepzC7T5KWhfbMXZMkDJ40FUjCNXXQxQSi0Dv4kQD4HOuPKJzjx7l7kznIbM5K0r7T9YQrJJayvJM0AXyOZbAPuz-EfOKjfj9xYZnEnE_uFKScdNIR6hlAdRLx28kpmB-mG5KKWQdGFNYdyZsp4kWK3dTZBDU29ELTZlDcwhoVpqZs715pflPrqrnvZiGL27ysDuodqXd4LfSedWXYflOExGXlz1nixq8dKTKJsUXt94_OBacs98-nk8jDG6pczt_oIpyfRgOC_Bi-K2It_Xx2w `, // Replace with your long-lived access token
        // 'Cookie': '__RequestVerificationToken=a70056eb-ea16-49b1-887e-2afec9cf72f5'
    };

    const response = await axios.post(url, payload, { headers });
    return response.data.access_token;
};

// Initialize DocuSign API client
const apiClient = new docusign.ApiClient();
apiClient.setBasePath(base_url);
apiClient.addDefaultHeader('Authorization', `Bearer ${generateToken()}`);

const sendEmailDoc = async (base64Document, document_id, email, subject, name, recipientId, accountId = process.env.accountId) => {
    try{
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes`;
    const payload = {
        "documents": [
            {
                "documentBase64": base64Document,
                "documentId": document_id,
                "fileExtension": "docx",
                "name": "document"
            }
        ],
        "emailSubject": subject,
        "recipients": {
            "signers": [
                {
                    "email": email,
                    "name": name,
                    "recipientId": recipientId
                }
            ]
        },
        "status": "sent"
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    // console.log("base64document is :" , base64Document);
    // console.log("document_id is:", documentId);
    // console.log("Email is:", email);
    // console.log("name is;", name);
    // console.log("recipientId is:", recipientId);
    // console.log("accountid is", accountId);
    console.log("Request URL:", url);
    //console.log("Request Payload:", JSON.stringify(payload, null, 2));
    console.log("Request Headers:", headers);

    const response = await axios.post(url, payload, { headers });
    return response.data;
    } catch (error) {
        console.error("Error handling send envelope service:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        }
    }
};

const envelopeStatusCheck = async (accountId = process.env.accountId, envelopesId) => {
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes/${envelopesId}`;

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const response = await axios.get(url, { headers });
    return response.data;
};

// Example of storing data to local DynamoDB
const storeDocumentMetadata = async (tableName, documentData) => {
    const params = {
        TableName: tableName,
        Item: documentData
    };

    try {
        await dynamoDb.put(params).promise();
        console.log('Document metadata stored successfully.');
    } catch (error) {
        console.error('Error storing document metadata:', error);
        throw error;
    }
};

module.exports = {
    convertToBase64,
    checkEnvelopeStatus,
    sendEmailDoc,
    envelopeStatusCheck,
    generateIds,
    storeDocumentMetadata // Export the function if needed elsewhere
};