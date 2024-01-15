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
          src={'/public/DFARESLogo-v3.svg'}
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
  display: inline-block;
  text-align: right;
  width: 200px; //750px;
  max-width: 80vw;

  img:hover {
    transform: scale(1.3);
  }

  @media only screen and (max-device-width: 1000px) {
    width: 100%;
    max-width: 100%;
    padding: 8px;
    font-size: 80%;
  }
`;

const LandingPageRoundArtImg = styled.img`
  cursor: pointer;
  transition: all 0.3s;
`;
