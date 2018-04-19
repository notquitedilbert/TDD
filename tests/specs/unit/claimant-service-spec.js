const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Claimant = require('../../../models/Claimant');
const service = require('../../../services/claimant-service');
const rewire = require('rewire');
const drivingLicenseService = require('../../../services/driving-license-service');
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

describe('Claimant Service', () => {

    let expectedSingleResult = {
        '_id':'1234567890',
        'firstName':'John',
        'lastName':'Doe'
    };

    it('should be defined', () => {
        expect(service).to.not.be.undefined;
    });

    describe('Get Claimants', () => {
        let findStub;
        const req = {};

        beforeEach(() => {
            findStub = sandbox.stub(Claimant,'find');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should retrieve all claimants', (done) => {
            const res = {
                send: sandbox.spy()
            };

            const expectedResult =[expectedSingleResult];

            findStub.resolves(expectedResult);

            service.getClaimants(req,res)
                .then((result)=>{
                    expect(res.send).to.have.been.calledOnce;

                    done();
                });
        });

    });

    describe('Get claimant by ID', () => {
        let findByIdStub;
        let req = {};

        beforeEach(() => {
            findByIdStub = sandbox.stub(Claimant,'findById');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should retieve a claimant by id', (done) => {
            const res = {
                send: sandbox.spy()
            };

            req = {
                params:{}
            };

            req.params.claimantId = '12345678';

            findByIdStub.resolves(expectedSingleResult);

            service.getClaimantById(req,res)
                .then((result)=>{
                    expect(res.send).to.have.been.calledOnce;
                    done();
                });
        });

        it('should behave...', () => {

        });

        it('should return a 404 when claimant not found', (done) => {
            const res = {
                send: sandbox.spy(),
                status: sandbox.stub()
            };
            const errMsg = 'Claimant not found matching given ID';

            findByIdStub.rejects(errMsg);
            res.status.withArgs(404).returns(res);

            service.getClaimantById(req,res)
                .then((result)=>{
                    expect(res.send).to.have.been.calledWith(errMsg);
                    done();
                });
        });
    });

    describe('Create Claimant', () => {
        let createStub;
        let req ={};
        let claimantServiceMock;
        let drivingLicenseServiceStub;

        beforeEach(() => {
            createStub = sandbox.stub(Claimant, 'create');
            claimantServiceMock = rewire('../../../services/claimant-service');
            drivingLicenseServiceStub = sandbox.stub(drivingLicenseService,'validate');
        });

        afterEach(() => {
            sandbox.restore();
        });


        it('should create a claimant', (done) => {
            const res = {
                send : sandbox.spy(),
                status: sandbox.stub()
            };
            req = {
                body:null
            };

            req.body = {
                'firstName':'john',
                'lastName':'doe',
                'nino':'AA111111A',
                'drivingLicenseNo':'CAMERON610096DWDXYA'
            };

            const joiMock = {
                validate :(body,schema,cb)=>{
                    cb(null, expectedSingleResult);
                }
            };

            claimantServiceMock.__set__('joi',joiMock);
            drivingLicenseServiceStub.resolves ({success:true});

            createStub.resolves(expectedSingleResult);

            res.status.withArgs(201).returns(res);

            service.createClaimant(req, res)
                .then((result)=>{
                    expect(res.send).to.have.been.calledWith(expectedSingleResult);
                    done();
                });

        });
        it('should create a claimant without driving license', (done) => {
            const res = {
                send : sandbox.spy(),
                status: sandbox.stub()
            };
            req = {
                body:null
            };

            req.body = {
                'firstName':'john',
                'lastName':'doe',
                'nino':'AA111111A'
            };

            const joiMock = {
                validate :(body,schema,cb)=>{
                    cb(null, expectedSingleResult);
                }
            };

            claimantServiceMock.__set__('joi',joiMock);
            drivingLicenseServiceStub.resolves ({success:true});

            createStub.resolves(expectedSingleResult);

            res.status.withArgs(201).returns(res);

            service.createClaimant(req, res)
                .then((result)=>{
                    expect(res.send).to.have.been.calledWith(expectedSingleResult);
                    done();
                });
        });

        it('should handle error when driving license fails validation', (done) => {
            const res ={
                send:sandbox.spy(),
                status:sandbox.stub()
            };
            req = {
                body:null
            };

            req.body = {
                'firstName':'john',
                'lastName':'doe',
                'nino':'AA111111A',
                'drivingLicenseNo':'CAMERON610096DWDXYA'
            };

            const joiMock = {
                validate :(body,schema,cb)=>{
                    cb(null, expectedSingleResult);
                }
            };

            const errMsg = 'Failed to validate driving license';
            drivingLicenseServiceStub.resolves(null);

            claimantServiceMock.__set__('Joi',joiMock);
            createStub.resolves(expectedSingleResult);
            res.status.withArgs(404).returns(res);

            service.createClaimant(req,res)
                .then((result)=>{
                    //expect(res.send).to.have.been.calledOnce;
                    expect(res.send).to.have.been.calledWith(errMsg);
                    done();
                });

        });
    });
});

// * arrange
// any setup that needs doing
// * act
// call the relevant function/code
// * assert
// check the results