import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactHowler from 'react-howler';
import { Slider } from '../Components/Slider';
import dfstyles from '../Styles/dfstyles';
import { DFZIndex } from '../Utils/constants';

const StyledAmbiencePane = styled.div`
  z-index: ${DFZIndex.MenuBar};
  padding-left: 0.75em;
  padding-top: 0.1em;
  margin-top: 0;
  display: flex;
  font-size: 1.5em;
  flex-direction: row;
  justify-content: flex-start;
  height: fit-content;
  width: 100%;
  & > a:first-child {
    margin-right: 0.75em;
  }
  color: ${dfstyles.colors.subtext};
  & > a {
    &:hover {
      color: ${dfstyles.colors.text};
      cursor: pointer;
    }
    &:active {
      color: ${dfstyles.colors.subbertext};
    }
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const scale = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
`;

const IconMusicNote = styled.div`
  display: inline-block;
  position: relative;
  min-width: 1rem;
  min-height: 1rem;

  &::before {
    content: "\\266A";
  }
`;

const IconLoading = styled(IconMusicNote)`
  &::after {
    content: "\\21BB";
    position: absolute;
    font-size: 1rem;
    left: .6rem;
    top: .6rem;
    animation: ${spin} 2s linear infinite;
  }
`;

const IconPlaying = styled(IconMusicNote)`
  &::after {
    content: "\\25B6";
    position: absolute;
    font-size: 1rem;
    left: .6rem;
    top: .6rem;
    animation: ${scale} 1s ease-in-out infinite;
  }
`;

const IconMuted = styled(IconMusicNote)`
  &::after {
    content: "\\23F8";
    position: absolute;
    font-size: 1rem;
    left: .6rem;
    top: .6rem;
  }
`;

export function AmbiencePane() {
  const [playing, setPlaying] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [hovering, setHovering] = useState<boolean>(false);

  const [volume, setVolume] = useState<number>(1.0)
  const onScrollVolumeChange = (e: Event & React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) setVolume(value);
  }

  return (
    <StyledAmbiencePane
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {loaded
      ? <a
          onClick={() => {
            setPlaying((b) => !b);
          }}
        >{playing ? (<IconPlaying/>) : (<IconMuted/>)}</a>
      : <IconLoading/>
      }
      {hovering &&
        <Slider
          hideStepper
          labelVisibility='none'
          value={volume}
          min={0.0}
          max={1.0}
          step={0.1}
          onChange={onScrollVolumeChange}
        />
      }
      <ReactHowler
        src='/sound.ogg'
        playing={playing}
        loop={true}
        html5={true}
        volume={volume}
        onLoad={() => {
          setLoaded(true);
          setPlaying(true);
        }}
      />
    </StyledAmbiencePane>
  );
}
