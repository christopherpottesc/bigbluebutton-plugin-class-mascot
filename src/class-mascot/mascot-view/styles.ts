import styled from 'styled-components';
import {
  colors,
  borderRadiusSmall,
  spacingXSmall,
  spacingSmall,
} from '@bigbluebutton/bbb-ui-components-react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacingSmall};
  width: 100%;
  min-width: 10rem;
  color: ${colors.text.default};
`;

const Info = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${spacingXSmall};
  width: 100%;
`;

const Image = styled.img`
  width: 8rem;
  height: 8rem;
  object-fit: contain;
`;

const Fallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  line-height: 1;
`;

const Bar = styled.div`
  width: 100%;
  height: 0.5rem;
  border-radius: ${borderRadiusSmall};
  background-color: ${colors.neutral.neutral4};
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background-color: ${colors.brand.brand1};
  transition: width 0.3s ease;
`;

export default {
  Wrapper,
  Info,
  Image,
  Fallback,
  Bar,
  BarFill,
};
