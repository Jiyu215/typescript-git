// export {};
// import * as React from "react";
// import { RefObject, useEffect, useRef } from 'react';
// import kurentoUtils from 'kurento-utils';
// import './App.css';

// const PARTICIPANT_MAIN_CLASS = 'participant main';
// const PARTICIPANT_CLASS = 'participant';

// interface ParticipantProps {
//     name: string;
//     sendMessage: (msg: any) => void;
// }

// class Participant {
//     name: string;
//     container: RefObject<HTMLDivElement>;
//     span: RefObject<HTMLSpanElement>;
//     video: RefObject<HTMLVideoElement>;
//     rtcPeer: any;
//     sendMessage: (message: any) => void;

//     constructor(name:string, sendMessage: (message:any) => void){
//         this.name = name;
        
//         // Ref 객체 생성
//         this.container = React.createRef<HTMLDivElement>();
//         this.span = React.createRef<HTMLSpanElement>();
//         this.video = React.createRef<HTMLVideoElement>();
    
//         this.container.className = this.isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
        
//         // WebRTC Peer 및 메시지 전송 함수 초기화
//         this.rtcPeer = null;
//         this.sendMessage = sendMessage;
        
//         // 메서드를 클래스에 바인딩
//         //this.onIceCandidate = this.onIceCandidate.bind(this);
//         const ContainerId: React.FC<Participant> = ({name}) => {
//             return (
//                 <div id={name}></div>
//             );
//         };

//         const ContainerClassName = () =>{
            
//         }
//         isPresentMainParticipant() {
//             return document.getElementsByClassName(PARTICIPANT_MAIN_CLASS).length !== 0;
//         }
        
//     }
// }

// const Webcam: React.FC = () => {
//     return (
//         <div>
//           <div id='container'>
//             <div className='title'>😁FACE OUT😁</div>
//             <input type="text" id="name" placeholder="Enter your name" />
//             <input type="text" id="roomName" placeholder="Enter room name" />
//             <button id="registerBtn" onClick={register}>🔑Enter🔑</button>
//           </div>
//           <button id="leaveBtn"onClick={leaveRoom}>🙌Leave🙌</button>
//           <div id='participants'>
//                 {Object.values(participants).map((participant) => (
//             <div key={participant.name}>
//               {participant.getVideoElement()} {/* 비디오 요소 사용 */}
//               <span>{participant.name}</span>
//             </div>
//           ))}
//           </div>
//         </div>
//       );
// }

// export default Webcam;