import * as React from "react";
import kurentoUtils from 'kurento-utils';
//import './App.css';

interface ParticipantProps {
  name: string;
  sendMessage: (msg: any) => void;
}

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

class Participant {
  name: string;
  container: HTMLDivElement;
  span: HTMLSpanElement;
  video: HTMLVideoElement;
  rtcPeer: any;
  sendMessage: (msg: any) => void;

  constructor({ name, sendMessage }: ParticipantProps) {
    this.name = name;
    this.container = document.createElement('div');
    this.container.className = this.isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
    this.container.id = name;
    this.span = document.createElement('span');
    this.video = document.createElement('video');
    this.rtcPeer = null;
    this.sendMessage = sendMessage;

    this.container.appendChild(this.video);
    this.container.appendChild(this.span);
    this.container.onclick = this.switchContainerClass.bind(this);
    const participantsContainer = document.getElementById('participants');
    if (participantsContainer) {
      participantsContainer.appendChild(this.container);
    }

    this.span.appendChild(document.createTextNode(name));

    this.video.id = 'video-' + name;
    this.video.autoplay = true;
    this.video.controls = false;
  }

  getElement() {
    return this.container;
  }

  getVideoElement() {
    return <>{this.video}</>;
  }

  switchContainerClass() {
    if (this.container.className === PARTICIPANT_CLASS) {
      var elements = Array.from(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)) as HTMLDivElement[];
      elements.forEach(item => {
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

  offerToReceiveVideo(error: any, offerSdp: any, wp: any) {
    if (error) return console.error('sdp offer error');
    console.log('Invoking SDP offer callback function');
    var msg = {
      id: 'receiveVideoFrom',
      sender: this.name,
      sdpOffer: offerSdp,
    };
    this.sendMessage(msg);
  }

  onIceCandidate(candidate: any, wp: any) {
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
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

const CodeTr: React.FC = () => {
  const ws = React.useRef<WebSocket | null>(null);
  const participants: { [key: string]: Participant } = {};
  const name = React.useRef<HTMLInputElement>(null);
  const room = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    ws.current = new WebSocket('wss://focusing.site:8081/signal');
    ws.current.onopen = function () {
      console.log('WebSocket connection opened.');
    };
    ws.current.onmessage = function (message) {
      var parsedMessage = JSON.parse(message.data);
      console.info('Received message: ' + message.data);

      switch (parsedMessage.id) {
        case 'existingParticipants':
          onExistingParticipants(parsedMessage);
          break;
        case 'newParticipantArrived':
          onNewParticipant(parsedMessage);
          break;
        case 'receiveVideoAnswer':
          receiveVideoResponse(parsedMessage);
          break;
        case 'iceCandidate':
          participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error: any) {
            if (error) {
              console.error("Error adding candidate: " + error);
              return;
            }
          });
          break;
        case 'participantExit':
          onParticipantLeft(parsedMessage);
          break;
        default:
          console.error('Unrecognized message', parsedMessage);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const register = () => {
    if (name.current && room.current) {
      const userName = name.current.value;
      const roomName = room.current.value;
      room.current.value = '';

      const container = document.getElementById('container');
      if (container) {
        container.style.visibility = 'hidden';
      }
      const leaveBtn = document.getElementById('leaveBtn');
      if (leaveBtn) {
        leaveBtn.style.visibility = 'visible';
      }

      const message = {
        id: 'join',
        name: userName,
        room: roomName,
      };
      sendMessage(message);
    }
  };

  const onNewParticipant = (request: any) => {
    receiveVideo(request.name);
  };

  const receiveVideoResponse = (result: any) => {
    participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error: any) {
      if (error) return console.error(error);
    });
  };

  function onExistingParticipants(msg: any) {
    var constraints = {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 320,
          maxFrameRate: 15,
          minFrameRate: 15,
        },
      },
    };
    console.log(name.current!.value + ' registered in room ' + room.current!.value);
    var participant = new Participant({ name: name.current!.value, sendMessage });
    participants[name.current!.value] = participant;
    var video = participant.getVideoElement();

    var options = {
      localVideo: video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };
    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error: any) {
      if (error) {
        return console.error(error);
      }
      this.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });

    msg.data.forEach(receiveVideo);
  }

  function leaveRoom() {
    const container = document.getElementById('container');
    if (container) {
      container.style.visibility = 'visible';
    }
    const leaveBtn = document.getElementById('leaveBtn');
    if (leaveBtn) {
      leaveBtn.style.visibility = 'hidden';
    }

    sendMessage({
      id: 'exit',
    });

    window.location.reload();
  }

  function receiveVideo(sender: string) {
    var participant = new Participant({ name: sender, sendMessage });
    participants[sender] = participant;
    var video = participant.getVideoElement();

    var options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };

    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error: any) {
      if (error) {
        return console.error(error);
      }

      this.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });
  }

  function onParticipantLeft(request: any) {
    console.log('Participant ' + request.name + ' left');
    var participant = participants[request.name];
    if (participant) {
      participant.dispose();
      delete participants[request.name];
    }
  }

  function sendMessage(message: any) {
    var jsonMessage = JSON.stringify(message);
    console.log('Sending message: ' + jsonMessage);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(jsonMessage);
    }
  }

  return (
    <div>
      <div id='container'>
        <div className='title'>😁FACE OUT😁</div>
        <input type="text" id="name" placeholder="Enter your name" />
        <input type="text" id="roomName" placeholder="Enter room name" />
        <button id="registerBtn" onClick={register}>🔑Enter🔑</button>
      </div>
      <button id="leaveBtn" onClick={leaveRoom}>🙌Leave🙌</button>
      <div id='participants'>
        {Object.values(participants).map((participant, index) => (
          <div key={index}>
            {participant.getVideoElement()}
            <span>{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeTr;