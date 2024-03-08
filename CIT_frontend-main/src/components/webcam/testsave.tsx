import * as React from "react";
import { RefObject } from 'react'; // useEffect, useRef는 사용되지 않으므로 삭제
import kurentoUtils from 'kurento-utils';
const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

class Participant{
    name: string;
    container:any;
    span: any;
    video: any;
    rtcPeer: any;
    sendMessage: (message: any) => void;

    constructor(name,sendMessage){
        const elementRef = React.useRef<HTMLDivElement>(null);
        this.name = name;
        this.span = React.createElement('span');
        this.video = React.createElement('video');
        this.container = React.createElement('div',{id:name,children:[this.video,this.span]});
        //클래스 이름 바꾸기 코드 작성 줄
        this.rtcPeer = null;
        this.sendMessage = sendMessage;
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
}

const testsave: React.FC = () => {
    const participant = new Participant('',()=>'');
    const container = React.createElement('div');
    const hi = React.createElement("p", {children:"hi"})
    const elemet = React.createElement("h1",{children:hi})
    
    return(
        <>
        <div id="participants">
        {participant.container}
        </div>
        </>
    );
};

export default testsave;