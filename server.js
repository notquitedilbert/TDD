//* get the middleware
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');


// * add the DB
mongoose.Promise = Promise;
mongoose.connect(config.get('dbURL'));

var Claimant = require('./models/Claimant');

//* load some middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

//* load the routes
server.use('/api', require('./routes/claimants-routes'));
const port = config.get('port') || 3000;

server.listen(port,()=>{
    console.info('port - ', port);
});
//* export the server
module.exports = server;

