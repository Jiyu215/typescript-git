// React 및 관련 라이브러리 임포트
import * as React from "react";
import { useEffect, useRef } from 'react';
import * as kurentoUtils from 'kurento-utils';
import './CodeTr.css';

// 참가자 클래스에 대한 상수 정의
const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

// Participant 클래스 정의
class Participant {
  // 속성 선언
  name: string;
  container: HTMLDivElement;
  span: HTMLSpanElement;
  video: HTMLVideoElement;
  rtcPeer: any; // RTC 피어 타입에 대한 정확한 정의가 없어 any로 임시 지정
  sendMessage: (message: any) => void;

  constructor(name: string, sendMessage: (message: any) => void) {
    this.name = name;
    this.sendMessage = sendMessage;
    this.rtcPeer = null; //추가

    // 컨테이너 및 관련 요소 생성
    this.container = document.createElement('div');
    this.container.className = this.isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
    this.span = document.createElement('span');
    this.video = document.createElement('video');

    console.log(this.container)
    this.onIceCandidate = this.onIceCandidate.bind(this); //추가

    // 컨테이너에 요소 추가
    this.container.appendChild(this.video);
    this.container.appendChild(this.span);
    this.container.onclick = this.switchContainerClass.bind(this);
    
    // 참가자 목록에 컨테이너 추가
    document.getElementById('participants')?.appendChild(this.container);

    // 참가자 이름 추가
    this.span.appendChild(document.createTextNode(name));
    
    // 비디오 요소 설정
    this.video.id = 'video-' + name;
    this.video.autoplay = true;
    this.video.controls = false;
  }

  // 메서드: 컨테이너 요소 반환
  getElement() {
    return this.container;
  }
  
  // 메서드: 비디오 요소 반환
  getVideoElement() {
    return <>{this.video}</>;
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

  // 메서드: RTC 피어 생성
  // createRtcPeer(options: any) {
  //   this.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error: any) => {
  //     if (error) {
  //       return console.error(error);
  //     }
  //     this.rtcPeer.generateOffer(this.offerToReceiveVideo.bind(this));
  //   });
  // }

  // 메서드: offer 생성 및 전송
  offerToReceiveVideo(error: any, offerSdp: any) {
    if (error) return console.error('sdp offer error');
    console.log('Invoking SDP offer callback function');
    var msg = {
      id: 'receiveVideoFrom',
      sender: this.name,
      sdpOffer: offerSdp,
    };
    this.sendMessage(msg);
  }

  // 메서드: ICE 후보 이벤트 처리 - 세션이 만들어질 때
  onIceCandidate(candidate: any) {
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

// React 컴포넌트 정의
const CodeTr: React.FC = () => {
  const [showJoinRoomInput,setShowJoinRoomInput] = React.useState(false);
  const ws = useRef<WebSocket | null>(null);
  const participants: { [name: string]: Participant } = {};
  const nameRef = useRef<HTMLInputElement>(null);
  const roomIdRef = useRef<HTMLInputElement>(null);

  // WebSocket 연결 및 메시지 수신 이펙트
  useEffect(() => {

    ws.current = new WebSocket('wss://focusing.site/signal');
    ws.current.onopen = function () {
      console.log('WebSocket connection opened.');
    }
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

  // 방 참가 함수
  const joinRoom = () => {
    if(!nameRef.current?.value) return;
    
    setShowJoinRoomInput(true);
    if (!nameRef.current?.value || !roomIdRef.current?.value) return;
    const message = {
      id: 'joinRoom',
      name: nameRef.current.value,
      roomId: roomIdRef.current.value,
    };
    sendMessage(message);

    document.getElementById('container')?.style.setProperty('visibility', 'hidden');
    document.getElementById('leaveBtn')?.style.setProperty('visibility', 'visible');
  };

  // 방 생성 함수
  const createRoom = () => {
    if (!nameRef.current?.value) return;
    const message = {
      id:'createRoom',
      name: nameRef.current.value,
    };
    sendMessage(message);
    
    document.getElementById('container')?.style.setProperty('visibility', 'hidden');
    document.getElementById('leaveBtn')?.style.setProperty('visibility', 'visible');
  };

  // 방 나가기 함수
  const leaveRoom = () => {
    sendMessage({ id: 'exit' });
    document.getElementById('container')?.style.setProperty('visibility', 'visible');
    document.getElementById('leaveBtn')?.style.setProperty('visibility', 'hidden');
    
    window.location.reload();
  };

  // 메시지 전송 함수
  const sendMessage = (message: any) => {
    const jsonMessage = JSON.stringify(message);
    console.log('Sending message: ' + jsonMessage);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(jsonMessage);
    }
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
    console.log(nameRef.current?.value + ' registered in room ' + roomIdRef.current?.value);
    const participant = new Participant(nameRef.current?.value || '', sendMessage);
    participants[nameRef.current?.value || ''] = participant;
    const video = participant.video;

    var options = {
      localVideo: video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };
    
   // participant.createRtcPeer(options);

    msg.data.forEach(receiveVideo);
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

  // 비디오 수신 함수
  const receiveVideo = (sender: any) => {
    const participant = new Participant(sender, sendMessage);
    participants[sender] = participant;
    const video = participant.video;

    const options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant),
    };

    //participant.createRtcPeer(options);
  };

  // 참가자 나가기 함수
  const onParticipantLeft = (request: any) => {
    console.log('Participant ' + request.name + ' left');
    const participant = participants[request.name];
    participant.dispose();
    delete participants[request.name];
  };

  return (
    <div>
      <div id='container'>
        <div className='title'>😁FACE OUT😁</div>
        <input type="text" ref={nameRef} placeholder="Enter your name" /> 
        {showJoinRoomInput && ( // showJoinRoomInput이 true일 때만 room input 박스를 표시
          <input type="text" ref={roomIdRef} placeholder="Enter room name" />
        )}
        <button id="registerBtn" onClick={createRoom}>🔑방 생성🔑</button>
        <button id="registerBtn" onClick={joinRoom}>방 참가</button>
      </div>
      <button id="leaveBtn" onClick={leaveRoom}>🙌Leave🙌</button>
      
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

export default CodeTr;
