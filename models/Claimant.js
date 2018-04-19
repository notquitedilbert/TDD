const mongoose = require('mongoose');
const claimantSchema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postCode: { type: String, required: true },
    nino: { type: String, required: true },
    drivingLicenceNo: { type: String, default: '' },
    dob: { type: String, required: true }

}, {
    vesrionKey: false
}
);
module.exports = mongoose.model('Claimant',claimantSchema,'Claimant');