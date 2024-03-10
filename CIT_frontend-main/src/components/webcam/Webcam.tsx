import * as React from "react";
import { useState, useRef, useEffect } from "react";
import * as kurentoUtils from 'kurento-utils';

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

interface ParticipantProps {
  name: string;
  rtcPeer?:any;
  ws: WebSocket | null; // WebSocket을 props로 받음
  sendMessage?: (message:any) => void;
}

const VideoElement: React.FC<ParticipantProps> = ({name,ws})=>{
    return(
        <video id={`video-${name}`}></video>
    );
}

const ParticipantList: React.FC<ParticipantProps> = ({name,ws})=>{
    // 주요 참가자인지 여부를 상태로 관리
    const [isMainParticipant, setIsMainParticipant] = useState(false);

    const onIceCandidate = (candidate: any, wp: any) => {
        console.log('Local candidate' + JSON.stringify(candidate));

        var message = {
            id: 'onIceCandidate',
            candidate: candidate,
            name: name, // 여기서 사용하려는 name은 ParticipantList 컴포넌트의 props로 전달된 name
        };
        sendMessage(message);
    };

    const sendMessage = (message:any) => {
        var jsonMessage = JSON.stringify(message);
        console.log('Sending message: '+jsonMessage);
        if(ws && ws.readyState === WebSocket.OPEN){ // ws.current에서 ws로 수정
            ws.send(jsonMessage); // ws.current에서 ws로 수정
        }
    }

    return(
        <div id={name} className={isMainParticipant? PARTICIPANT_MAIN_CLASS : PARTICIPANT_CLASS}>
            <VideoElement name={name} ws={ws}/>
            <span>{name}</span>
        </div>
    );
}

const Webcam: React.FC = () => {
    //참조값 설정
    const nameRef = useRef<HTMLInputElement>(null);
    const roomIdRef = useRef<HTMLInputElement>(null);
    const ws = useRef<WebSocket | null>(null);
    const participants: { [name: string]: ParticipantProps } = {};
    

    //사용자 이름을 상태로 관리
    const [userName, setUserName] = useState<string>("");

    const register = () => {
        if(nameRef.current && nameRef.current.value){
            setUserName(nameRef.current.value);
        }
    }

    //WebSocket 연결 및 메시지 수신
    useEffect(()=>{
        ws.current = new WebSocket('wss://focusing.site/signal');
        //WebSocket 연결 성공
        ws.current.onopen = function () {
            console.log('WebSocket connection opened.');
        }
        ws.current.onmessage = function(message:any){
            //JSON형태로 메시지 파싱
            var parsedMessage = JSON.parse(message.data);
            console.info('Received message: ' + message.data);
            
            switch (parsedMessage.id) {
            case 'existingParticipants':
                // onExistingParticipants(parsedMessage);
                break;
            case 'newParticipantArrived':
                // onNewParticipant(parsedMessage);
                break;
            case 'receiveVideoAnswer':
                // receiveVideoResponse(parsedMessage);
                break;
            case 'iceCandidate':
                participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
                if (error) {
                    console.error("Error adding candidate: " + error);
                    return;
                }
                });
                break;
            case 'participantExit':
                // onParticipantLeft(parsedMessage); 
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
    },[]);
  return (
    <>
    <div id='container'>
        <div className='title'>😁FACE OUT😁</div>
        <input type="text" id="name" ref={nameRef} placeholder="Enter your name" />
        <input type="text" id="roomName" ref={roomIdRef} placeholder="Enter room name" />
        <button id="registerBtn" onClick={register}>🔑방 생성🔑</button>
        <button id="registerBtn">🔑방 참가🔑</button>
    </div>
    <div id='participants'>
        {userName && <ParticipantList name={userName}  ws={ws.current}/>}
    </div>
    </>
  );
};

 export default Webcam;
// export {};