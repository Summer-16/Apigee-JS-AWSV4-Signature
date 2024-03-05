; (function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    /* global define */
    define(['crypto-js/core', 'crypto-js/sha256', 'crypto-js/hmac-sha256'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('crypto-js/core'),
      require('crypto-js/sha256'),
      require('crypto-js/hmac-sha256'));
  } else {
    /* global CryptoJS */
    root.awsSignV4Apigee = factory(CryptoJS, CryptoJS.SHA256, CryptoJS.HmacSHA256);
  }
}(this, function (CryptoJS) {

  function createSignature(signData) {

    // Extract the parameters
    var request = signData.request;
    var config = signData.config;

    // Extract the configuration
    var host = config.host;
    var uri = config.uri;
    var accessKey = config.accessKey;
    var secretKey = config.secretKey;
    var region = config.region;
    var service = config.service;

    // Algorithm used for signing
    var algorithm = 'AWS4-HMAC-SHA256';

    // Get the current timestamp in UTC
    var now = new Date();
    var amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

    // Create a date string for the credential scope
    var dateStamp = amzDate.substr(0, 8);
    var credentialScope = dateStamp + '/' + region + '/' + service + '/aws4_request';

    // Canonical URI - '/' because it's the root of the SQS service
    var canonicalUri = uri || '/';

    // Canonical Query String - encode the parameters in the URL
    var canonicalQuerystring = Object.keys(request.params).sort().map(key => key + '=' + request.params[key]).join('&');

    // Canonical Headers - include the 'host' header and the 'x-amz-date' header
    var canonicalHeaders = 'host:' + host + '\n' + 'x-amz-date:' + amzDate + '\n';

    // Signed Headers - 'host' and 'x-amz-date' in this case
    var signedHeaders = 'host;x-amz-date';

    var payload = request.body ? (typeof request.body === 'object' ? JSON.stringify(request.body) : request.body) : '';

    // Payload hash - hash the empty string for GET requests
    var payloadHash = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);

    // Construct Canonical Request
    var canonicalRequest = [
      request.method, // HTTP request method (GET, POST, etc.)
      canonicalUri,   // Canonical URI
      canonicalQuerystring, // Canonical query string
      canonicalHeaders,     // Canonical headers
      signedHeaders,        // Signed headers
      payloadHash           // Payload hash
    ].join('\n');

    // Hash the canonical request
    var hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);

    // Construct String-to-Sign
    var stringToSign = [
      algorithm,         // Algorithm used (AWS4-HMAC-SHA256)
      amzDate,           // Date and time of the request (yyyyMMdd'T'HHmmss'Z')
      credentialScope,   // Credential Scope (date/region/service/aws4_request)
      hashedCanonicalRequest // Hashed Canonical Request
    ].join('\n');

    // Generate signing key
    var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + secretKey);
    var kRegion = CryptoJS.HmacSHA256(region, kDate);
    var kService = CryptoJS.HmacSHA256(service, kRegion);
    var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);

    // Calculate the signature
    var signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);

    // Authorization header
    var authorizationHeader = algorithm + ' ' +
      'Credential=' + accessKey + '/' + credentialScope + ', ' +
      'SignedHeaders=' + signedHeaders + ', ' +
      'Signature=' + signature;

    // Return the signed headers
    return {
      'authorization': authorizationHeader,
      'xAmzDate': amzDate,
      'host': host
    };
  }

  return {
    createSignature: createSignature
  };

}));
