var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');
var socketIO = require('socket.io');


var server=app.use(compression()).use(express.static(path.join(__dirname, './dist')))
.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json()).listen(process.env.PORT || 3000);


