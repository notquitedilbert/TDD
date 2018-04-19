const express = require('express');
const router = express.Router();
const Claimant = require('../models/Claimant');

router.route('/claimants')
    //* return a array of claimants
    .get((req, res) => {
        Claimant.find({}, (err, claimants) => {
            res.send(claimants);
        });
    })
    //* handle post routes
    .post((req, res) => {
        Claimant.create(req.body)
            .then((createdClaimant) => {
                res.status(201).send(createdClaimant);
            });
    });

router.route('/claimants/:id')
    //* handle the GET route/endpoint with an id
    .get((req, res) => {
        let claimantId = req.params.id;
        Claimant.findById(claimantId)
            .then((retrievedClaimant) => {
                res.send(retrievedClaimant);
            }).catch((err) => {
                res.status(404).end();
            });
    })

    //* handle PUT
    .put((req, res) => {
        let claimantID = req.params.id;
        Claimant.findById(claimantID)
            .then((retrievedClaimant) => {
                Object.assign(retrievedClaimant, req.body)
                    .save((err, updated) => {
                        res.status(204).end();

                    });
            });
    })
    //* handle deletes
    .delete((req, res) => {
        let claimantID = req.params.id;

        Claimant.findByIdAndRemove(claimantID)
            .then((deleted) => {
                res.status(200).end();
            })
            .catch((err) => {
                res.status(404).end();
            });
    });

router.route('/claimants/nino/:nino')
    .get((req,res)=>{
        const nino = req.params.nino;
        Claimant.findOne({nino})
            .then((claimant)=>{
                if(!claimant){
                    return res.status(404).end();
                }
                res.send(claimant);
            });

    });
module.exports = router;