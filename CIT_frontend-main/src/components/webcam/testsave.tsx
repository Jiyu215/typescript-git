import * as React from "react";
import { useState, useRef, useEffect } from "react";
import kurentoUtils from 'kurento-utils';

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

interface ParticipantProps {
  name: string;
  sendMessage: (message: any) => void;
  isMainButton?: boolean; // 새로운 prop 추가: 방 생성 버튼 여부
}

const VideoElement: React.FC<{ id: string; autoplay?: boolean; controls?: boolean }> = ({ id, autoplay = true, controls = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video id={id} ref={videoRef} autoPlay={autoplay} controls={controls}></video>
  );
}

const Participant: React.FC<ParticipantProps> = ({ name, sendMessage, isMainButton }) => {
  const participantClassName = isMainButton ? PARTICIPANT_MAIN_CLASS : PARTICIPANT_CLASS;
  const containerRef = useRef<HTMLDivElement>(null);

  const switchContainerClass = () => {
    if (containerRef.current?.className === PARTICIPANT_CLASS) {
      const elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
      elements.forEach(function (item: any) {
        item.className = PARTICIPANT_CLASS;
      });
        containerRef.current.className = PARTICIPANT_MAIN_CLASS;
    } else {
        containerRef.current.className = PARTICIPANT_CLASS;
    }
  }

  return (
    <div id={name} className={participantClassName} ref={containerRef} onClick={switchContainerClass}>
      <VideoElement id={'video-' + name} />
      <span>{name}님이 들어오셨습니다.</span>
    </div>
  );
}

const testsave: React.FC = () => {
  const [name, setName] = useState("");
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //추가
  const ws = useRef<WebSocket | null>(null);
  const room = useRef<HTMLInputElement>(null);

  const handleButtonClick = (isMainButton: boolean) => {
    if (name.trim() === "") {
      setError("Please enter your name.");
      return;
    }

    setParticipantName(name);
    setError(null);
  }

  return (
    <>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
      <button onClick={() => handleButtonClick(true)}>Create Room</button>
      <button onClick={() => handleButtonClick(false)}>Join Room</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {participantName && (
        <div id="participants">
          <Participant name={participantName} sendMessage={() => {}} isMainButton={true} />
        </div>
      )}
    </>
  );
};

export default testsave;