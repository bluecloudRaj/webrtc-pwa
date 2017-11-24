var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');

var socketIO=require('socket.io');

var INDEX = path.join(__dirname, './dist');
var PORT = process.env.PORT || 3000;

const server = express()
    .use(express.static(path.join(__dirname, './dist')))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



