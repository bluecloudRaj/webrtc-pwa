var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');


app.use(compression());
app.use(express.static(path.join(__dirname, './dist')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());



/// app runs in port
app.listen(process.env.PORT || 3000, function () {
    console.log('listening at 3000');
});