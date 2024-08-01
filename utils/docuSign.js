const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const base64 = require('base-64');
//const random = require('random');

dotenv.config();

const base_url = process.env.BASE_URL;
const iss = process.env.ISS;
const sub = process.env.SUB;

// Your private key (replace this with your actual private key)
const private_key = `
-----BEGIN RSA PRIVATE KEY-----
MIIEoQIBAAKCAQEAwgcnT5FtrxXqQaMcsu/giH3QproIN+SXPDjy9B4w/9npUcym
3WrHtKqoWYRTDcIjo+7re2N+aXaBYi/98D7xBTDpsZ24UuOAak5KthXQq/FyRVfm
/AXT/RWgwd4sZSpOMA+3A01ndCL+eKz+lvIZUqFgqGqS9cwmCETyJDfr3PwiuuiA
H2jm6ksPJUYwcAmUQ3T9PnrhYOiiZa7ymeiW7o7KOG5t0M8fntV69NX8LE704KSm
QGgnNm08L0LE7yYN6wdmK7XgIrbTbsroiYolFiNRX1oFoeGVmGCYVPxedKY+bLq6
J6KxxmfQUpROtJMUmRKGfgL9JHs9cH3wd9JdkwIDAQABAoH/cO2485axQDaBIbLO
AVecV9TinCeqoN1rKKH8xhjMbB1orzNt63E6yuyJD5D0xg04sTFd3XMLIFbY90z3
f90iauMNIVOq9JN1KmpnEZOg4HKnD7UZu5WozKTJ7Axjyn3VBCQhYMqsa+vyMEp/
41sFYhKLL3rYDjfD6ww14t6paPRTIDXwY8PmtjVSpRgTp9ImYWTsgDMde5opZB5A
sa8ACVJ69bWbHR5FJMRRCGPFMYlzhjt1cYbx8vJERLxyUkfLqdepCqwHkC7jiXhq
SQjW1WqwG7fTU6ga+ixwAF6cs5JiLbigxdjLHgLOTBislYKP8SocwoStTa1jxO+g
X/WpAoGBAO/XLhGhzROzt6ggLiuPIV1k2+qKUsbnJ22tR5GTc1ceUEJhkM5nu61C
OFtPquwJ3swdUgsrBV6cpfuUdCxYjzYyTwv21YjQiMVMqD8r/9dVHJIs7MapdGy6
VrHVp0R9LDO4jBfC/viDs7wI+eCkGmWMMTPP4iliL9CGoHabXnydAoGBAM8ZyciE
/UISTp5AgwVPCuk1SYRHs+5ZmJTyVs9Oun/db3fkSORwbCEpAbO/cdgnEI4G34VO
G6xK7mYIww8KLB5CyrIHol3KFTmRMjTz9lTaW8G7LcoPptVO9JICPbYxk6rq+2xI
VW9xbcS5cvZYUOpoaPYIGuwedufZ16RHr/PvAoGAMvAxoZ8KrjeKNxP2mlvAy1Qj
fPG52PK5JgsaWynE4mjWxPJxzdSsQIUC8Sm/dHg4MIO9rA+MCWcdvYvvDIgWin0u
2qym93LKyZSZWyleIf66nbUa6KqOxpTg2s40w1AOdkGox1crzd4y6ynA4FwaGx0m
SgnJz95Bp3kgVXB0JeUCgYBcOFCJMOcRh9NoVrPBJmxmYmslM0SlK1JtaOhNEfKs
Q2+ChK4Mwx7zOS5f2y0XonWVuOvJkXlzJD66QsaRKOdyZi2aTxn3B6ih5MzllYko
Sb+4KeB+7K9OpwTzC3ptafAmmNJyaldY87p8clQF7FfDudCbVgqfAAXUwkVrCt0I
EwKBgQC/Q/6nzt7rlngyE9dCNpLrxx/YLB2Ee7flnnw1SHKpYRpzAEvuBqqzbK4b
t0otNLsUXYSjYDwl+H9kBIE0yYZUBTkEfGcufjb8yOacVvKIubeK5QOgXmABa3gd
iHfNlQ3s9nJHVGyb3Ing7N3ig8onFH6q5F97Ny4lsx134JOMBg==
-----END RSA PRIVATE KEY-----
`;

// Your public key (replace this with your actual public key)
const public_key = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwgcnT5FtrxXqQaMcsu/g
iH3QproIN+SXPDjy9B4w/9npUcym3WrHtKqoWYRTDcIjo+7re2N+aXaBYi/98D7x
BTDpsZ24UuOAak5KthXQq/FyRVfm/AXT/RWgwd4sZSpOMA+3A01ndCL+eKz+lvIZ
UqFgqGqS9cwmCETyJDfr3PwiuuiAH2jm6ksPJUYwcAmUQ3T9PnrhYOiiZa7ymeiW
7o7KOG5t0M8fntV69NX8LE704KSmQGgnNm08L0LE7yYN6wdmK7XgIrbTbsroiYol
FiNRX1oFoeGVmGCYVPxedKY+bLq6J6KxxmfQUpROtJMUmRKGfgL9JHs9cH3wd9Jd
kwIDAQAB
-----END PUBLIC KEY-----
`;

// Payload for the JWT
const payload = {
    iss: iss,
    sub: sub,
    aud: "account-d.docusign.com",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    scope: "signature impersonation"
};

// Generate the JWT token
const token = jwt.sign(payload, private_key, { algorithm: 'RS256' });

const convertToBase64 = (filePath, isFile) => {
    filePath = filePath.replace(' ', '');
    if (isFile) {
        const binaryData = filePath.read();
        const base64Data = base64.encode(binaryData);
        return base64Data;
    } else {
        const binaryData = fs.readFileSync(filePath);
        const base64Data = base64.encode(binaryData);
        return base64Data;
    }
};

const checkEnvelopeStatus = async (envelopeId, accountId = '0ea5464e-3084-4fb9-a399-9421c04b2007') => {
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes/${envelopeId}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await axios.get(url, { headers });
    return response.data;
};

// const generateIds = () => {
//     return random.int(10000, 999999);
// };

const generateToken = async () => {
    const url = 'https://account-d.docusign.com/oauth/token';

    const payload = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer YOUR_LONG_LIVED_ACCESS_TOKEN` // Replace with your long-lived access token
    };

    const response = await axios.post(url, payload, { headers });
    return response.data.access_token;
};

const sendEmailDoc = async (base64Document, documentId, email, subject, name, recipientId, accountId) => {
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes`;
    const payload = {
        "documents": [
            {
                "documentBase64": base64Document,
                "documentId": documentId,
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

    const response = await axios.post(url, payload, { headers });
    return response.data;
};

const envelopeStatusCheck = async (accountId, envelopesId) => {
    const token = await generateToken();
    const url = `${base_url}/accounts/${accountId}/envelopes/${envelopesId}`;

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const response = await axios.get(url, { headers });
    return response.data;
};