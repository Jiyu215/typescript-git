/*export {};

import { useEffect, useRef } from 'react';
import kurentoUtils from 'kurento-utils';
import './App.css';

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

class Participant {
  
  constructor(name, sendMessage) {
    this.name = name;
    this.container = document.createElement('div');
    this.container.className = this.isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
    this.container.id = name;
    this.span = document.createElement('span');
    this.video = document.createElement('video');
    this.rtcPeer = null;
    this.sendMessage = sendMessage;
    this.onIceCandidate = this.onIceCandidate.bind(this);


    this.container.appendChild(this.video);
    this.container.appendChild(this.span);
    this.container.onclick = this.switchContainerClass.bind(this);
    document.getElementById('participants').appendChild(this.container);

    this.span.appendChild(document.createTextNode(name));

    this.video.id = 'video-' + name;
    this.video.autoplay = true;
    this.video.controls = false;
  }

  getElement() {
    return this.container;
  }

  getVideoElement() {
    return this.video;
  }

  switchContainerClass() {
    if (this.container.className === PARTICIPANT_CLASS) {
      var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
      elements.forEach(function (item) {
        item.className = PARTICIPANT_CLASS;
      });

      this.container.className = PARTICIPANT_MAIN_CLASS;
    } else {
      this.container.className = PARTICIPANT_CLASS;
    }
  }

  isPresentMainParticipant() {
    return document.getElementsByClassName(PARTICIPANT_MAIN_CLASS).length !== 0;
  }

  offerToReceiveVideo(error, offerSdp, wp) {
    if (error) return console.error('sdp offer error');
    console.log('Invoking SDP offer callback function');
    var msg = {
      id: 'receiveVideoFrom',
      sender: this.name,
      sdpOffer: offerSdp,
    };
    this.sendMessage(msg);
  }

  onIceCandidate(candidate, wp) {
    console.log('Local candidate' + JSON.stringify(candidate));

    var message = {
      id: 'onIceCandidate',
      candidate: candidate,
      name: this.name,
    };
    this.sendMessage(message);
  }

  dispose() {
    console.log('Disposing participant ' + this.name);
    if (this.rtcPeer) {
      this.rtcPeer.dispose();
    }
    this.container.parentNode.removeChild(this.container);
  }
}
*/