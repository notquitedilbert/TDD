const Claimant = require('../models/Claimant');
const drivingService = require('../services/driving-license-service');
const Joi = require('joi');
const { CREATED,NO_CONTENT, NOT_FOUND, BAD_REQUEST } = require('http-status-codes');

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

const updateSchema = Joi.object().keys({
    firstName:Joi.string().optional(),
    lastName:Joi.string().optional(),
    street:Joi.string().optional(),
    city:Joi.string().optional(),
    postCode:Joi.string().optional(),

}).options({allowUnknown:false,abortEarly:true});

const getClaimants = (req,res)=>{
    return Claimant.find({})
        .then(claimants => res.send(claimants));
};

const getClaimantById = (req,res) =>{
    const claimantId = req.params.claimantId;
    return Claimant.findById(claimantId)
        .then(claimant => res.send(claimant))
        .catch(err => res.status(NOT_FOUND).send(err.name));
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
                                res.status(CREATED).send(createdClaimant);
                            });
                    }else{

                        res.status(NOT_FOUND).send('Failed to validate driving license');
                    }
                });
        }else{
            Claimant.create(validatedBodyValue)
                .then((createdClaimant)=>{
                    res.status(CREATED).send(createdClaimant);
                });
        }
    }).catch(err => res.status(BAD_REQUEST).send(err.name));



const updateClaimant = (req,res)=>{
    const { claimantId } = req.params;

    return Joi.validate(req.body,updateSchema)
        .then((validBody)=>{
            Claimant.findByIdAndUpdate(claimantId,{ $set: validBody })
                .then((updatedClaimant)=>{
                    res.status(NO_CONTENT).send(updatedClaimant);
                })
                .catch(err => res.status(NOT_FOUND).send(err.name));
        })
        .catch(err=> res.status(BAD_REQUEST).send(err.name));
};

const deleteClaimant = (req,res)=>{
    const { claimantId } = req.params;

    return Claimant.findByIdAndRemove(claimantId)
        .then((claimant)=>{
            if(!claimant){
                return res.status(NOT_FOUND).send(
                    `Claimant matching ID ${claimantId} not found`
                );
            }
            return res.send(claimant);
        });
};

const getClaimantByNINO = (req,res)=>{
    const {nino}  = req.params;

    return Claimant.findOne(nino)
        .then((claimant)=>res.send(claimant));
};

module.exports = {
    getClaimants,
    getClaimantById,
    createClaimant,
    updateClaimant,
    deleteClaimant,
    getClaimantByNINO
};