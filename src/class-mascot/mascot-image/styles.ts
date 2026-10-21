import styled, { css, keyframes } from 'styled-components';

import { LevelDirection } from '../mascot-view/level-change';

const SIZES = {
  large: '8rem',
  option: '4rem',
  small: '2rem',
};

type MascotImageSize = keyof typeof SIZES;

const levelUp = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.18); }
  70% { transform: scale(0.96); }
  100% { transform: scale(1); }
`;

const levelDown = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  35% { transform: translateY(8%); opacity: 0.55; }
  100% { transform: translateY(0); opacity: 1; }
`;

const Frame = styled.div<{ $size: MascotImageSize; $direction: LevelDirection | null }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${({ $size }: { $size: MascotImageSize }) => SIZES[$size]};
  height: ${({ $size }: { $size: MascotImageSize }) => SIZES[$size]};
  line-height: 1;
  ${({ $direction }) =>
    $direction &&
    css`
      animation: ${$direction === 'up' ? levelUp : levelDown} 0.6s ease-out;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Image = styled.img<{ $pixelArt: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: ${({ $pixelArt }) => ($pixelArt ? 'pixelated' : 'auto')};
`;

export { MascotImageSize };

export default {
  Frame,
  Image,
};
