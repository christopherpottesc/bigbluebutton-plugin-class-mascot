import styled from 'styled-components';
import {
  colors,
  spacingXSmall,
  spacingSmall,
  spacingSmallMedium,
  spacingMedium,
} from '@bigbluebutton/bbb-ui-components-react';

const Card = styled.div<{ $minimized: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $minimized }: { $minimized: boolean }) => ($minimized ? 'auto' : '15rem')};
  color: ${colors.text.default};
`;

// Minimized for the current user only: picture, level and the essential buttons.
const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacingSmall};
  padding: ${spacingXSmall} ${spacingXSmall} ${spacingXSmall} ${spacingSmall};
`;

const ChipText = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
`;

// Read by screen readers, not shown.
const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  Chip,
  ChipText,
  VisuallyHidden,
  Header,
  HeaderActions,
  Body,
  Confirm,
  ConfirmActions,
};
