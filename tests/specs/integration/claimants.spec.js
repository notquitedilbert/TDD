const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJson = require('chai-json');
const expect = chai.expect;
const apiBaseURI = '/api/claimants/';
const httpStatus = require('http-status-codes');

//* get the claimant schema
const Claimant = require('../../../models/Claimant');

//* extend Chai
chai.use(chaiHttp);
chai.use(chaiJson);

const api = require('../../../server');

describe('claimants API', () => {
    let newClaimant;

    beforeEach((done) => {
        newClaimant = new Claimant;
        newClaimant.firstName = 'John';
        newClaimant.lastName = 'Doe';
        newClaimant.street = 'Test Street';
        newClaimant.city = 'Manchester';
        newClaimant.postCode = 'M3 4RF';
        newClaimant.dob = '2011-10-31';
        newClaimant.nino = 'AS234567H';
        Claimant.remove({}, (err) => {
            done(err);
        });
    });

    it('Should be defined', () => {
        expect(api).to.not.be.undefined;
    });

    describe('GET/:id claimant', () => {
        //* test to see if it return a claimant
        it('should return a claimant by ID', (done) => {

            //* add a claimant
            Claimant.create(newClaimant)
                .then((createdClaimant) => {
                    const claimantId = createdClaimant.id;
                    chai.request(api)
                        .get(apiBaseURI + claimantId)
                        .end((err, response) => {
                            expect(response).to.have.status(200);
                            expect(response.body).to.be.a('object');
                            expect(response.body).to.have.property('firstName');
                            done();
                        });
                });
        });

        it('should return 404 when claimant not found', (done) => {
            chai.request(api)
                .get(apiBaseURI + 'aaaa')
                .end((err, response) => {
                    expect(response).to.have.status(404);
                    done();
                });
        });
    });

    describe('/POST claimants', () => {
        it('Should allow claimant to be created', (done) => {
            chai.request(api)
                .post(apiBaseURI)
                .send(newClaimant)
                .end((err, response) => {
                    expect(response).to.have.status(201);
                    expect(response.body).to.be.a('object');
                    expect(response.body).to.have.property('firstName').eql(newClaimant.firstName);
                    done();
                });

        });
    });

    describe('/GET claimants', () => {
        it('Should return a list of claimants', (done) => {
            Claimant.create(newClaimant)
                .then((createdClaimant) => {
                    chai.request(api)
                        .get(apiBaseURI)
                        .end((err, response) => {
                            expect(response).to.have.status(200);
                            expect(response.body).to.be.a('array');
                            expect(response.body).to.have.length(1);
                            const item = response.body[0];
                            expect(item).to.have.property('firstName').eql(newClaimant.firstName);
                            done();
                        });
                });

        });
    });

    describe('/PUT/:id', () => {
        it('Should update claimants details', (done) => {
            Claimant.create(newClaimant)
                .then((createdClaimant) => {
                    const updateRequest = {
                        street: 'ashbrooke',
                        city: 'east boldon',
                        postCode: '1234'

                    };
                    chai.request(api)
                        .put(`${apiBaseURI}${createdClaimant.id}`)
                        .send(updateRequest)
                        .end((err, response) => {
                            expect(response).to.have.status(204);
                            done();
                        });
                });
        });

    });

    describe('/DELETE/:id', () => {
        it('should delete a claimant by ID', (done) => {
            Claimant.create(newClaimant)
                .then((createdClaimant)=>{
                    chai.request(api)
                        .del(`${apiBaseURI}${createdClaimant.id}`)
                        .end((err,response)=>{
                            expect(response).to.have.status(200);
                            done();
                        });
                });
        });
        it('should return 404 when not found', (done) => {
            chai.request(api)
                .del(`${apiBaseURI}aaa`)
                .end((err,response)=>{
                    expect(response).to.have.status(404);
                    done();
                });
        });
    });

    describe('/GET/claimants/:nino', () => {
        it('should find claimant given by NINO', (done) => {

            Claimant.create(newClaimant)
                .then((createdClaimant)=>{
                    let nino = createdClaimant.nino;
                    chai.request(api)
                        .get(`${apiBaseURI}nino/${nino}`)
                        .end((err,response)=>{
                            expect(response.status).to.equal(httpStatus.OK);
                            expect(typeof response.body).to.equal('object');
                            expect(response.body).to.have.property('firstName').eql(createdClaimant.firstName);
                            done();
                        });
                });
        });

        it('should return 404 when nino not found', (done) => {
            chai.request(api)
                .get(`${apiBaseURI}nino/AA999999A`)
                .end((err,response)=>{
                    expect(response.status).to.equal(httpStatus.NOT_FOUND);
                    done();
                });
        });
    });
});
