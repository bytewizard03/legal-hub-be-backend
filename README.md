# legal-hub-be-backend

## To run Locally
- Set up dynamo db locally
- create table name as legal-docs

## To create Table
- aws dynamodb create-table --table-name legal-docs --attribute-definitions AttributeName=id,AttributeType=N --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000

## To Delete Table
- aws dynamodb delete-table --table-name legal-docs --region localhost --endpoint-url http://localhost:8000

## steps to run 
- go to desired path in command prompt where local dynamodb is set up 
- 1. D:  (if is in D drive)
- 2. cd dynamodb_local_latest
- 3. java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

## To List table present in local dynamodb
- aws dynamodb list-tables --endpoint-url http://localhost:8000

## Describe a particular table
- aws dynamodb describe-table --table-name legal-docs --endpoint-url http://localhost:8000

## create account on https://developers.docusign.com/
- update the required data in .env and private, public key in docusign.js as shown on https://developers.docusign.com/ under My Apps and keys.

## create account on https://account-d.docusign.com/
- It will help to sign and send the docs through email

### Run through npm run dev
