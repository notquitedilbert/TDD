const nock = require('nock');

const chai = require('chai');
const expect = chai.expect;
const config = require('config');

const serviceUrl = config.get('drivingLicenseServiceUrl');
const serviceEndpoint = config.get('drivingLicenseEndPoint');

const service = require('../../../services/driving-license-service');
const serviceOKResponse = require('../../data/driving-service-mocks/success-ok');
const badRequestResponse = require('../../data/driving-service-mocks/bad-request');



describe('Driving License Service', () => {

    const requestPayload = {
        firstName :'john',
        lastName :'doe',
        dirvingLicenseNo :'ABCDEFGHIJKL',
        dob:'01-01-2000'
    };
    it('should be defined', () => {
        expect(service).to.not.be.undefined;
    });

    describe('Validate Success', () => {
        beforeEach(() => {
            nock(serviceUrl)
                .post(`/${serviceEndpoint}`,requestPayload)
                .reply(200,serviceOKResponse);
        });
        afterEach(() => {
            nock.cleanAll();
        });
        it('should return a successful response given valid credentials', (done) => {
            service.validate(requestPayload)
                .then((response)=>{
                    expect(typeof response).to.equal('object');
                    expect(response.message).to.equal('license is valid');
                    done();
                });
        });
    });

    describe('Validate unsuccessful ', () => {
        beforeEach(() => {
            nock(serviceUrl)
                .post(`/${serviceEndpoint}`,requestPayload)
                .reply(400,badRequestResponse);
        });
        afterEach(() => {
            nock.cleanAll();
        });

        it('should return error when invalid credentials supplied', () => {
            service.validate(requestPayload)
                .catch((err)=>{
                    expect(typeof err).to.equal('object');
                    expect(err.message).to.equal('Driving License is invalid');
                    expect(err.reason).to.equal('Driver details do not match license number');
                });
        });
    });
});

