import * as React from "react";
import { RefObject } from 'react'; // useEffect, useRef는 사용되지 않으므로 삭제
import kurentoUtils from 'kurento-utils';

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

class Participant {
    name: string;
    container:any;
    span: any;
    video: any;
    rtcPeer: any;
    sendMessage: (message: any) => void;

    constructor(name,sendMessage){
        this.name = name;
        this.container = React.createElement('div',{id:name});
        this.span = React.createElement('span');
        this.video = React.createElement('video');

        //클래스 이름 바꾸기 코드 작성 줄
        
        this.rtcPeer = null;
        this.sendMessage = sendMessage;
        
    }
}

const Webcam: React.FC = () => {
    const container = React.createElement('div');
    const hi = React.createElement("p", {children:"hi"})
    const elemet = React.createElement("h1",{children:hi})
    
    return(
        <>
        <div>{elemet}</div>
        </>
    );
};

export default Webcam;