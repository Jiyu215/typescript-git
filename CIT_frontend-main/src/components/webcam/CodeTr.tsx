import * as React from "react";
import { useEffect, useRef } from 'react';
import kurentoUtils from 'kurento-utils';
import './CodeTr.css';


const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

// Participant 클래스 선언
class Participant {
  name: string;
  container: HTMLDivElement;
  span: HTMLSpanElement;
  video: HTMLVideoElement;
  rtcPeer: any; // RTC 피어 타입에 대한 정확한 정의가 없어 any로 임시 지정
  sendMessage: (message: any) => void;

  constructor(name: string, sendMessage: (message: any) => void) {
    this.name = name;
    this.sendMessage = sendMessage;

    // 컨테이너 및 관련 요소 생성
    this.container = document.createElement('div');
    this.container.className = this.isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
    this.container.id = name;
    this.span = document.createElement('span');
    this.video = document.createElement('video');

    // 비디오 요소 설정
    this.video.id = 'video-' + name;
    this.video.autoplay = true;
    this.video.controls = false;

    // 컨테이너에 요소 추가
    this.container.appendChild(this.video);
    this.container.appendChild(this.span);

    // 컨테이너의 클릭 이벤트 핸들러 설정
    this.container.onclick = this.switchContainerClass.bind(this);

    // 참가자 목록에 컨테이너 추가
    document.getElementById('participants')?.appendChild(this.container);

    // 참가자 이름 추가
    this.span.appendChild(document.createTextNode(name));
  }

  // 메서드: 컨테이너 요소 반환
  getElement() {
    return this.container;
  }

  // 메서드: 비디오 요소 반환
  getVideoElement() {
    return <>{this.video}</>;
  }

  // 메서드: 참가자 클래스 전환
  switchContainerClass() {
    if (this.container.className === PARTICIPANT_CLASS) {
      // 현재 참가자가 주요 참가자인 경우 모든 주요 참가자 클래스를 일반 참가자 클래스로 변경
      var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
      elements.forEach(function (item: HTMLElement) {
        item.className = PARTICIPANT_CLASS;
      });

      // 현재 참가자 클래스를 주요 참가자 클래스로 변경
      this.container.className = PARTICIPANT_MAIN_CLASS;
    } else {
      // 현재 참가자 클래스를 일반 참가자 클래스로 변경
      this.container.className = PARTICIPANT_CLASS;
    }
  }

  // 메서드: 주요 참가자 여부 확인
  isPresentMainParticipant() {
    return document.getElementsByClassName(PARTICIPANT_MAIN_CLASS).length !== 0;
  }

  // 메서드: 비디오 수신을 위한 offer 생성
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

  // 메서드: ICE 후보 이벤트 처리
  onIceCandidate(candidate: any, wp: any) {
    console.log('Local candidate' + JSON.stringify(candidate));

    var message = {
      id: 'onIceCandidate',
      candidate: candidate,
      name: this.name,
    };
    this.sendMessage(message);
  }

  // 메서드: 자원 해제
  dispose() {
    console.log('Disposing participant ' + this.name);
    if (this.rtcPeer) {
      this.rtcPeer.dispose();
    }
    this.container.parentNode?.removeChild(this.container);
  }
}

// React 컴포넌트
const App: React.FC = () => {
  const ws = useRef<WebSocket | null>(null);
  const participants: { [name: string]: Participant } = {};
  const name = useRef<HTMLInputElement>(null);
  const room = useRef<HTMLInputElement>(null);

  // 웹소켓 연결 및 메시지 수신 이펙트
  useEffect(() => {
    ws.current = new WebSocket('wss://focusing.site:8081/signal');
    ws.current.onopen = function () {
      console.log('WebSocket connection opened.');
    }
    console.log(name);
    ws.current.onmessage = function (message:any) {
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

  // 참가자 등록 함수
  const register = () => {
    if (!name.current || !room.current) return;

    const message = {
      id: 'join',
      name: name.current.value,
      room: room.current.value,
    };
    sendMessage(message);

    document.getElementById('container')?.style.setProperty('visibility', 'hidden');
    document.getElementById('leaveBtn')?.style.setProperty('visibility', 'visible');
  };

  // 새로운 참가자 도착 함수
  const onNewParticipant = (request: any) => {
    receiveVideo(request.name);
  };

  // 비디오 응답 수신 함수
  const receiveVideoResponse = (result: any) => {
    participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, (error: any) => {
      if (error) return console.error(error);
    });
  };

  // 기존 참가자 처리 함수
  const onExistingParticipants = (msg: any) => {
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 320,
          maxFrameRate: 15,
          minFrameRate: 15,
        },
      },
    };
    console.log(name.current?.value + ' registered in room ' + room.current?.value);
    const participant = new Participant(name.current?.value || '', sendMessage);
    participants[name.current?.value || ''] = participant;
    const video = participant.video;

    var options = {
      localVideo: video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };
    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error: any) => {
      if (error) {
        return console.error(error);
      }
      participant.rtcPeer.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });

    msg.data.forEach(receiveVideo);
  };

  // 방 나가기 함수
  const leaveRoom = () => {
    sendMessage({ id: 'exit' });
    document.getElementById('container')?.style.setProperty('visibility', 'visible');
    document.getElementById('leaveBtn')?.style.setProperty('visibility', 'hidden');
    
    window.location.reload();
  };

  // 비디오 수신 함수
  const receiveVideo = (sender: any) => {
    const participant = new Participant(sender, sendMessage);
    participants[sender] = participant;
    const video = participant.video;

    const options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };

    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error: any) => {
      if (error) {
        return console.error(error);
      }
      participant.rtcPeer.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });
  };

  // 참가자 나가기 함수
  const onParticipantLeft = (request: any) => {
    console.log('Participant ' + request.name + ' left');
    const participant = participants[request.name];
    participant.dispose();
    delete participants[request.name];
  };

  // 메시지 전송 함수
  const sendMessage = (message: any) => {
    const jsonMessage = JSON.stringify(message);
    console.log('Sending message: ' + jsonMessage);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(jsonMessage);
    }
  };

  return (
    <div>
      <div id='container'>
        <div className='title'>😁FACE OUT😁</div>
        <input type="text" id="name" placeholder="Enter your name" />
        <input type="text" id="roomName" placeholder="Enter room name" />
        <button id="registerBtn" onClick={register}>🔑Enter🔑</button>
      </div>
      <button id="leaveBtn"onClick={leaveRoom}>🙌Leave🙌</button>
      <div id='participants'>
        {Object.values(participants).map((participant) => (
          <div key={participant.name}>
            {participant.getVideoElement()} {/* 비디오 요소 사용 */}
            <span>{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
