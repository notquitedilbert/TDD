const rp = require('request-promise');
const config = require('config');

const serviceUrl = config.get('drivingLicenseServiceUrl');
const serviceEndpoint = config.get('drivingLicenseEndPoint');

const validate = (requestPayload)=> {
    const options = {
        uri:`${serviceUrl}/${serviceEndpoint}`,
        json:true,
        method:'POST',
        body:requestPayload
    };
    return rp(options)
        .then(parsedResponse => parsedResponse)
        .catch(err => err);
};

module.exports = {validate};
