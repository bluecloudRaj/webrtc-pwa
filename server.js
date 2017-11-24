var socketIO = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');

var http = require('http').Server(app);

app.use(compression());
app.use(express.static(path.join(__dirname, './dist')));

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.listen(process.env.PORT || 3000, function () {
    console.log('listening at 3000');
});

