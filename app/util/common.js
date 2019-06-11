const crypto = require("crypto");
const fs = require('fs');
const { promisify } = require('util');



const writeFileAsync = promisify(fs.writeFile);


function encrypt_sha512(secret, str) {
    var hmac = crypto.createHmac("sha512", secret);
    var signed = hmac.update(str).digest("hex");
    return signed

}




function encrypt_sha384(secret, str){

  var hmac = crypto.createHmac("sha384", secret);
  var signed = hmac.update(str).digest("hex");
  return signed
  // const payload = new Buffer.from(JSON.stringify(str)).toString('base64');
  //
  // const signature = crypto
  //   .createHmac('sha384', secret)
  //   .update(payload)
  //   .digest('hex');
  //
  // return signature;
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * Format number to two digits
 **/
function twoDigits(d) {
   if (0 <= d && d < 10) return "0" + d.toString();
   if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
   return d.toString();
}

function toCamelCase(str) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
};



module.exports = {
  twoDigits,
  encrypt_sha512,
  encrypt_sha384,
  toCamelCase,
  writeFileAsync
}
