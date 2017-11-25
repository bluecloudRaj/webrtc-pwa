'use strict';

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .use(express.static(path.join(__dirname, './dist')))
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

// var io = require('socket.io').listen(server);