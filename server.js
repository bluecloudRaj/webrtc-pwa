var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');

var server = require('http').Server(app);


app.use(compression());
app.use(express.static(path.join(__dirname, './dist')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

server.listen(process.env.PORT || 3000);

