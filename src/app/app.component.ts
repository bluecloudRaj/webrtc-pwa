import { Component, OnInit, ViewChild  } from '@angular/core';
import * as io from 'socket.io-client';

declare var window :any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  title = 'app';
  isChannelReady = false;
  isInitiator = false;
  isStarted = false;
  localStream;
  pc;
  remoteStream;
  turnReady;
  pcConfig :any = {
    'iceServers': [{
      'urls': 'stun:stun.l.google.com:19302'
    }]
  };
  sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };
  room = 'foo';
  socket;
  constructor() {
    this.socket = io.connect();
  }

  // @ViewChild('localVideo') localVideo;
  // @ViewChild('remoteVideo') remoteVideo;
  localVideo;
  remoteVideo;

  ngOnInit () {
    let self = this;
    self.localVideo = document.querySelector('#localVideo');
    self.remoteVideo = document.querySelector('#remoteVideo');
    // if (window.location.hostname !== 'localhost') {
    //   self.requestTurn(
    //     'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    //   );
    // }
    
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
      } else if (message.type === 'offer') {
        if (!self.isInitiator && !self.isStarted) {
          self.maybeStart();
        }
        self.pc.setRemoteDescription(new RTCSessionDescription(message));
        self.doAnswer();
      } else if (message.type === 'answer' && self.isStarted) {
        self.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && self.isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        self.pc.addIceCandidate(candidate);
      } else if (message === 'bye' && self.isStarted) {
        self.handleRemoteHangup();
      }
    });
  }

  sendMessage(message) {
    console.log('Client sending message: ', message);
    this.socket.emit('message', message);
  }

  gotStream(stream) {
    console.log('Adding local stream.');
    this.localVideo.src = window.URL.createObjectURL(stream);
    this.localStream = stream;
    this.sendMessage('got user media');
    if (this.isInitiator) {
      this.maybeStart();
    }
  }

  constraints = {
    video: true
  };

  maybeStart() {
    if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
      console.log('>>>>>> creating peer connection');
      this.createPeerConnection();
      this.pc.addStream(this.localStream);
      this.isStarted = true;
      if (this.isInitiator) {
        this.doCall();
      }
    }
  }



  createPeerConnection() {
    try {
      this.pc = new RTCPeerConnection(null);
      this.pc.onicecandidate = this.handleIceCandidate.bind(this);
      this.pc.onaddstream = this.handleRemoteStreamAdded.bind(this);
      this.pc.onremovestream = this.handleRemoteStreamRemoved.bind(this);
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }

  handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      this.sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates.');
    }
  }

  handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    this.remoteVideo.src = window.URL.createObjectURL(event.stream);
    this.remoteStream = event.stream;
  }

  handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
  }

  doCall() {
    console.log('Sending offer to peer');
    this.pc.createOffer(this.setLocalAndSendMessage.bind(this), this.handleCreateOfferError.bind(this));
  }

  doAnswer() {
    console.log('Sending answer to peer.');
    this.pc.createAnswer().then(
      this.setLocalAndSendMessage.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
  }

  setLocalAndSendMessage(sessionDescription) {
    // Set Opus as the preferred codec in SDP if Opus is present.
    //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    this.pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    this.sendMessage(sessionDescription);
  }

  onCreateSessionDescriptionError(error) {
    console.error('Failed to create session description: ' + error.toString());
  }

  requestTurn(turnURL) {
    let self = this;
    let turnExists = false;
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
  }


  handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
  }

  hangup() {
    console.log('Hanging up.');
    stop();
    this.sendMessage('bye');
  }

  handleRemoteHangup() {
    console.log('Session terminated.');
    this.stop();
    this.isInitiator = false;
  }

  stop() {
    this.isStarted = false;
    // isAudioMuted = false;
    // isVideoMuted = false;
    this.pc.close();
    this.pc = null;
  }

  ///////////////////////////////////////////

  // Set Opus as the default audio codec if it's present.
  preferOpus(sdp) {
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
          sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex],
            opusPayload);
        }
        break;
      }
    }

    // Remove CN in m line and sdp.
    sdpLines = this.removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
  }

  extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
  }

  // Set the selected codec to the first in m line.
  setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
      if (index === 3) { // Format of media starts from the fourth.
        newLine[index++] = payload; // Put target payload to the first.
      }
      if (elements[i] !== payload) {
        newLine[index++] = elements[i];
      }
    }
    return newLine.join(' ');
  }

  // Strip CN from sdp before CN constraints is ready.
  removeCN(sdpLines, mLineIndex) {
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
  }
}
