import { CONTRACT_ADDRESS } from '@dfares/contracts';
import { address } from '@dfares/serde';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

export function LandingPageRoundArt() {
  const history = useHistory();
  const defaultAddress = address(CONTRACT_ADDRESS);

  return (
    <Container>
      <ImgContainer>
        <LandingPageRoundArtImg
          // src={'/public/DFARESLogo-v3.svg'}
          src={'/public/favicon.ico'}
          onClick={() => history.push(`/play/${defaultAddress}`)}
        />
        {/* <Smaller>
          <Text>Art by</Text> <TwitterLink twitter='JannehMoe' />{' '}
        </Smaller> */}
      </ImgContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImgContainer = styled.div`
  position: relative;
  display: inline-block;
  text-align: right;
  width: 128px; //750px;
  max-width: 80vw;
  aspect-ratio: 1;
  background-color: #ffb4c1;
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    pointer-events: none;
    background: transparent;
    filter: blur(7px);
    animation: logoFlame 2.8s linear infinite alternate;
    z-index: -2;
  }

  @keyframes logoFlame {
    0% {
      box-shadow:
        0 -10px 12px rgba(255, 180, 193, 0.78),
        7px -7px 14px rgba(255, 100, 146, 0.5),
        -6px -5px 11px rgba(255, 195, 205, 0.42),
        2px 0 10px rgba(255, 180, 193, 0.28);
      opacity: 0.72;
      transform: skewX(-3deg);
    }
    33% {
      box-shadow:
        -4px -13px 14px rgba(255, 180, 193, 0.82),
        9px -4px 12px rgba(255, 100, 146, 0.46),
        -9px -7px 16px rgba(255, 195, 205, 0.5),
        0 1px 8px rgba(255, 180, 193, 0.24);
      opacity: 0.9;
      transform: skewX(2deg);
    }
    66% {
      box-shadow:
        5px -12px 13px rgba(255, 180, 193, 0.75),
        -8px -8px 13px rgba(255, 100, 146, 0.48),
        8px -2px 11px rgba(255, 195, 205, 0.36),
        0 0 9px rgba(255, 180, 193, 0.26);
      opacity: 0.8;
      transform: skewX(-2deg);
    }
    100% {
      box-shadow:
        2px -15px 16px rgba(255, 180, 193, 0.86),
        10px -8px 15px rgba(255, 100, 146, 0.45),
        -4px -3px 10px rgba(255, 195, 205, 0.46),
        0 1px 8px rgba(255, 180, 193, 0.22);
      opacity: 1;
      transform: skewX(3deg);
    }
  }

  @media only screen and (max-device-width: 1000px) {
    width: 100%;
    max-width: 100%;
    padding: 8px;
    font-size: 80%;
  }
`;

const LandingPageRoundArtImg = styled.img`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  cursor: pointer;
`;
