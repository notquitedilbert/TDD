const axios = require('axios');
const config = require('config');

const serviceUrl = config.get('drivingLicenseServiceUrl');
const serviceEndpoint = config.get('drivingLicenseEndPoint');

const validate = (requestPayload)=> axios.post(`${serviceUrl}/${serviceEndpoint}`,requestPayload)
    .then((response)=>response.data)
    .catch((err)=>{
        err.response.data;
    });


module.exports = {validate};
