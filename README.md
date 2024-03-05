# Apigee-JS-AWSV4-Signature

awsSignV4Apigee.js is a Pure JavaScript implementation of AWS Signature Version 4 signing process for use with Amazon Web Services (AWS) APIs. 

This is a custom implementation which uses Googles's SHA256 libraries to specifically work with Apigee Edge/Apigee X or inside a vanilla JavaScript Environment.

## Usage
Just load all the files in the `src` folder into your project and use the `awsSignV4Apigee` function to sign your requests.

### Simple Example
```
const signData = {
  request: {
    method: 'POST',
    params: "",
    body: encodedMessageBody
  },
  config: {
    host: sqsHost,
    uri: sqsURI,
    accessKey: sqsAccessKey,
    secretKey: sqsSecretKey,
    region: sqsRegion,
    service: "sqs"
  }
};

var signedHeaders = awsSignV4Apigee.createSignature(signData);
console.log(signedHeaders);
/*
{
  authorization : "AWS4-HMAC-SHA256 Credential=AKIA6DAAAAWLWABC3ADC/20240305/us-east-1/sqs/aws4_request, SignedHeaders=host;x-amz-date, Signature=109301af24018edfd27e8bb182asdfdsdfdss9b98e8ac9af63c62399295fdc3d"
  host : "sqs.us-east-1.amazonaws.com"
  xAmzDate : "20240305T051902Z"
}
*/

```

### For Apigee proxy example check the `example` folder.

Note: The implementation uses the `var` keyword for defining variables. If you are using this in a modern environment, you can replace `var` with `let` or `const` as per your requirement. I have used `var` for compatibility with Apigee environment.