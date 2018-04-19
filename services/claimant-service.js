const Claimant = require('../models/Claimant');
const drivingService = require('../services/driving-license-service');
const Joi = require('joi');

const schema = Joi.object()
    .keys({
        drivingLicenseNo: Joi
            .string()
            .regex(/^[a-zA-Z]{2,}\d{6}[a-zA-Z0-9]{6}$/i)
            .allow('')
            .allow(null),
        nino: Joi
            .string()
            .regex(/^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-z]?\s*$/)
            .required()
    }).options({
        allowUnknown:true,
        abortEarly:true
    });

const getClaimants = (req,res)=>{
    return Claimant.find({})
        .then(claimants => res.send(claimants));
};

const getClaimantById = (req,res) =>{
    const claimantId = req.params.claimantId;
    return Claimant.findById(claimantId)
        .then(claimant => res.send(claimant))
        .catch(err => res.status(404).send(err.name));
};

const createClaimant = (req, res)=> Joi.validate(req.body,schema)
    .then((validatedBodyValue)=>{
        let drivingRequest = null;
        if(req.body.drivingLicenseNo){
            drivingRequest = {
                firstName:'',
                lastName:'',
                drivingLicenseNo:'',
                dob:''
            };
            // create a new object with merged properties
            Object.assign({},drivingRequest,req.body);

            return drivingService.validate(drivingRequest)
                .then((response)=>{

                    if(response){
                        Claimant.create(validatedBodyValue)
                            .then((createdClaimant)=>{
                                res.status(201).send(createdClaimant);
                            });
                    }else{

                        res.status(404).send('Failed to validate driving license');
                    }
                });
        }else{
            Claimant.create(validatedBodyValue)
                .then((createdClaimant)=>{
                    res.status(201).send(createdClaimant);
                });
        }
    }).catch(err => res.status(400).send(err.name));



module.exports = {getClaimants,getClaimantById,createClaimant};