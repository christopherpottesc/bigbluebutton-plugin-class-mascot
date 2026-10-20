import styled from 'styled-components';
import {
  colors,
  spacingXSmall,
  spacingSmall,
  spacingSmallMedium,
  spacingMedium,
} from '@bigbluebutton/bbb-ui-components-react';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 15rem;
  color: ${colors.text.default};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacingSmall};
  min-height: 2.5rem;
  padding: ${spacingXSmall} ${spacingXSmall} ${spacingXSmall} ${spacingSmallMedium};
  border-bottom: 1px solid ${colors.neutral.neutral4};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacingXSmall};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${spacingSmall};
  padding: ${spacingSmall} ${spacingSmallMedium} ${spacingSmallMedium};
`;

const Confirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacingMedium};
  padding: ${spacingMedium} ${spacingSmallMedium} ${spacingSmallMedium};
  text-align: center;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: ${spacingSmall};

  & > * {
    flex: 1;
  }
`;

export default {
  Card,
  Header,
  HeaderActions,
  Body,
  Confirm,
  ConfirmActions,
};
