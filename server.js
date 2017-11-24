var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');

var socketIO = require('socket.io');


app.use(compression());
app.use(express.static(path.join(__dirname, './dist')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

var server = require('http').createServer(app);

/// app runs in port
server.listen(process.env.PORT || 3000, function () {
    console.log('listening at 3000');
});



