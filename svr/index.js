let express = require('express');
let bodyParser = require('body-parser');
let compression = require('compression');

let app = express();

app.use(express.static(__dirname + '/../dist'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = app;