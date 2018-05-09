
const { NO_CONTENT,NOT_FOUND,BAD_REQUEST } = require('http-status-codes');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Claimant = require('../../../models/Claimant');
const service = require('../../../services/claimant-service');
const rewire = require('rewire');
const drivingLicenseService = require('../../../services/driving-license-service');


const sandbox = sinon.sandbox.create();
const claimantServiceMock = rewire('../../../services/claimant-service');
chai.use(sinonChai);

describe('Claimant Service', () => {

    afterEach(() => {
        sandbox.restore();
    });

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

        let drivingLicenseServiceStub;

        beforeEach(() => {
            createStub = sandbox.stub(Claimant, 'create');
            drivingLicenseServiceStub = sandbox.stub(drivingLicenseService,'validate');
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

    describe('update Claimant', () => {
        let updateStub;
        let req = {};
        const createUpdateRequest = claimantId => ({
            params: claimantId,
            body:{
                firstName:'John',
                lastName:'Doe'
            }
        });

        beforeEach(()=>{
            updateStub = sandbox.stub(Claimant,'findByIdAndUpdate');
        });

        it('should update claimant details', async () => {
            const res = {
                send: sandbox.spy(),
                status: sandbox.stub()
            };
            req = createUpdateRequest('12345');

            expectedSingleResult.street = 'new Street';
            res.status.withArgs(NO_CONTENT).returns(res);

            updateStub.resolves(expectedSingleResult);

            await service.updateClaimant(req,res);
            expect(res.send).to.have.been.calledOnce;
        });

        it('should return ${NOT_FOUND} when claimant does not exist', async () => {
            const res = {
                send: sandbox.spy(),
                status:sandbox.stub()
            };
            req = {
                body:null,
                params:{claimantID :'999999'}
            };

            req.body = {
                firstName:'John',
                lastName:'Doe'
            };
            const errorMessage = 'Claimant not found matching given ID';

            updateStub.rejects(errorMessage);

            res.status.withArgs(NOT_FOUND).returns(res);

            await service.updateClaimant(req,res);

            expect(res.send).to.have.been.calledWith(errorMessage);
        });

        it('should prevent a claimants NINO from being updated', async () => {

            const res = {
                send: sandbox.spy(),
                status:sandbox.stub()
            };
            req = createUpdateRequest('12345');
            req.body.nino ='BB123456B';
            joiMock = {
                validate:(body,schema,cb) =>{
                    cb(null);
                }
            };
            claimantServiceMock.__set__('Joi',joiMock);
            const expectedErrorMessage = 'ValidationError';

            res.status.withArgs(BAD_REQUEST).returns(res);
            await service.updateClaimant(req,res);

            expect(res.send).to.have.been.calledWith(expectedErrorMessage);
        });
    });

    describe('delete claimant', () => {

        let findByIdAndRemoveStub;
        let req = {};

        beforeEach(() => {
            findByIdAndRemoveStub = sandbox.stub(Claimant,'findByIdAndRemove');

        });

        it('Should delete a claiimant', async () => {
            const res = {
                send: sandbox.spy()
            };
            req = {
                params:{claimantId:'123456'}
            };
            findByIdAndRemoveStub.resolves(expectedSingleResult);

            await service.deleteClaimant(req,res);
            expect(res.send).to.have.been.calledOnce;
        });

        it(`should return ${NOT_FOUND} when claimant does not exist`, async () => {
            const res = {
                send:sandbox.spy(),
                status: sandbox.stub()
            };

            req = {
                params:{claimantId : '9999999'}
            };

            const errorMessage = `Claimant matching ID ${req.params.claimantId} not found`;
            findByIdAndRemoveStub.resolves(null);

            res.status.withArgs(NOT_FOUND).returns(res);

            await service.deleteClaimant(req,res);

            expect(res.send).to.have.been.calledWith(errorMessage);

        });
    });

    describe('Search by NINO', () => {
        let findOneStub;
        let req = {};

        beforeEach(()=>{
            findOneStub = sandbox.stub(Claimant,'findOne');
        });


        it('should retrieve claimant by NINO', async () => {
            const res = {
                send:sandbox.spy()
            };
            req = {params:{
                nino:'JK123456A'
            }};
            findOneStub.resolves(expectedSingleResult);

            await service.getClaimantByNINO(req,res);

            expect(res.send).to.have.been.calledOnce;
        });
    });
});

// * arrange
// any setup that needs doing
// * act
// call the relevant function/code
// * assert
// check the results