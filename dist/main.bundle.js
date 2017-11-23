webpackJsonp(["main"],{

/***/ "../../../../../src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "../../../../../src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div id=\"videos\">\n  <div>\n    <video id=\"localVideo\" autoplay muted style=\"width:200px;height:200px;\"></video>\n    <video id=\"remoteVideo\" autoplay style=\"width:400px;height:400px;\"></video>\n  </div>\n</div>"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client__ = __webpack_require__("../../../../socket.io-client/lib/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_socket_io_client___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_socket_io_client__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppComponent = (function () {
    function AppComponent() {
        this.title = 'app';
        this.isChannelReady = false;
        this.isInitiator = false;
        this.isStarted = false;
        this.pcConfig = {
            'iceServers': [{
                    'urls': 'stun:stun.l.google.com:19302'
                }]
        };
        this.sdpConstraints = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };
        this.room = 'foo';
        this.constraints = {
            video: true
        };
        this.socket = __WEBPACK_IMPORTED_MODULE_1_socket_io_client__["connect"]();
    }
    AppComponent.prototype.ngOnInit = function () {
        var self = this;
        self.localVideo = document.querySelector('#localVideo');
        self.remoteVideo = document.querySelector('#remoteVideo');
        if (window.location.hostname !== 'localhost') {
            self.requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
        }
        window.navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        })
            .then(self.gotStream.bind(self))
            .catch(function (e) {
            console.log(e);
        });
        window.onbeforeunload = function () {
            self.sendMessage('bye');
        };
        if (self.room !== '') {
            self.socket.emit('create or join', self.room);
            console.log('Attempted to create or  join room', self.room);
        }
        self.socket.on('created', function (room) {
            console.log('Created room ' + room);
            self.isInitiator = true;
        });
        self.socket.on('full', function (room) {
            console.log('Room ' + room + ' is full');
        });
        self.socket.on('join', function (room) {
            console.log('Another peer made a request to join room ' + room);
            console.log('This peer is the initiator of room ' + room + '!');
            self.isChannelReady = true;
        });
        self.socket.on('joined', function (room) {
            console.log('joined: ' + room);
            self.isChannelReady = true;
        });
        self.socket.on('log', function (array) {
            console.log.apply(console, array);
        });
        // This client receives a message
        self.socket.on('message', function (message) {
            console.log('Client received message:', message);
            if (message === 'got user media') {
                self.maybeStart();
            }
            else if (message.type === 'offer') {
                if (!self.isInitiator && !self.isStarted) {
                    self.maybeStart();
                }
                self.pc.setRemoteDescription(new RTCSessionDescription(message));
                self.doAnswer();
            }
            else if (message.type === 'answer' && self.isStarted) {
                self.pc.setRemoteDescription(new RTCSessionDescription(message));
            }
            else if (message.type === 'candidate' && self.isStarted) {
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                });
                self.pc.addIceCandidate(candidate);
            }
            else if (message === 'bye' && self.isStarted) {
                self.handleRemoteHangup();
            }
        });
    };
    AppComponent.prototype.sendMessage = function (message) {
        console.log('Client sending message: ', message);
        this.socket.emit('message', message);
    };
    AppComponent.prototype.gotStream = function (stream) {
        console.log('Adding local stream.');
        this.localVideo.src = window.URL.createObjectURL(stream);
        this.localStream = stream;
        this.sendMessage('got user media');
        if (this.isInitiator) {
            this.maybeStart();
        }
    };
    AppComponent.prototype.maybeStart = function () {
        if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
            console.log('>>>>>> creating peer connection');
            this.createPeerConnection();
            this.pc.addStream(this.localStream);
            this.isStarted = true;
            if (this.isInitiator) {
                this.doCall();
            }
        }
    };
    AppComponent.prototype.createPeerConnection = function () {
        try {
            this.pc = new RTCPeerConnection(null);
            this.pc.onicecandidate = this.handleIceCandidate.bind(this);
            this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
            this.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);
        }
        catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
        }
    };
    AppComponent.prototype.handleIceCandidate = function (event) {
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            this.sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        }
        else {
            console.log('End of candidates.');
        }
    };
    AppComponent.prototype.handleRemoteStreamAdded = function (event) {
        console.log('Remote stream added.');
        this.remoteVideo.src = window.URL.createObjectURL(event.stream);
        this.remoteStream = event.stream;
    };
    AppComponent.prototype.handleCreateOfferError = function (event) {
        console.log('createOffer() error: ', event);
    };
    AppComponent.prototype.doCall = function () {
        console.log('Sending offer to peer');
        this.pc.createOffer(this.setLocalAndSendMessage.bind(this), this.handleCreateOfferError.bind(this));
    };
    AppComponent.prototype.doAnswer = function () {
        console.log('Sending answer to peer.');
        this.pc.createAnswer().then(this.setLocalAndSendMessage.bind(this), this.onCreateSessionDescriptionError.bind(this));
    };
    AppComponent.prototype.setLocalAndSendMessage = function (sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        this.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        this.sendMessage(sessionDescription);
    };
    AppComponent.prototype.onCreateSessionDescriptionError = function (error) {
        console.error('Failed to create session description: ' + error.toString());
    };
    AppComponent.prototype.requestTurn = function (turnURL) {
        var self = this;
        var turnExists = false;
        for (var i in this.pcConfig.iceServers) {
            if (this.pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                turnExists = true;
                this.turnReady = true;
                break;
            }
        }
        if (!turnExists) {
            console.log('Getting TURN server from ', turnURL);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var turnServer = JSON.parse(xhr.responseText);
                    console.log('Got TURN server: ', turnServer);
                    self.pcConfig.iceServers.push({
                        'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                        'credential': turnServer.password
                    });
                    self.turnReady = true;
                }
            };
            xhr.open('GET', turnURL, true);
            xhr.send();
        }
    };
    AppComponent.prototype.handleRemoteStreamRemoved = function (event) {
        console.log('Remote stream removed. Event: ', event);
    };
    AppComponent.prototype.hangup = function () {
        console.log('Hanging up.');
        stop();
        this.sendMessage('bye');
    };
    AppComponent.prototype.handleRemoteHangup = function () {
        console.log('Session terminated.');
        this.stop();
        this.isInitiator = false;
    };
    AppComponent.prototype.stop = function () {
        this.isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        this.pc.close();
        this.pc = null;
    };
    ///////////////////////////////////////////
    // Set Opus as the default audio codec if it's present.
    AppComponent.prototype.preferOpus = function (sdp) {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null) {
            return sdp;
        }
        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }
        // Remove CN in m line and sdp.
        sdpLines = this.removeCN(sdpLines, mLineIndex);
        sdp = sdpLines.join('\r\n');
        return sdp;
    };
    AppComponent.prototype.extractSdp = function (sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
    };
    // Set the selected codec to the first in m line.
    AppComponent.prototype.setDefaultCodec = function (mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) {
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) {
                newLine[index++] = elements[i];
            }
        }
        return newLine.join(' ');
    };
    // Strip CN from sdp before CN constraints is ready.
    AppComponent.prototype.removeCN = function (sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }
        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    };
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("../../../../../src/app/app.component.html"),
            styles: [__webpack_require__("../../../../../src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("../../../platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["E" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */]
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("../../../../../src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_5" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ }),

/***/ 1:
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map