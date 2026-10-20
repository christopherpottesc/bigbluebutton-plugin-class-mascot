import * as React from 'react';
import { useEffect, useState } from 'react';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { MAX_POINTS, MIN_POINTS, MASCOT_OPTIONS } from '../constants';
import { MascotModel } from '../types';
import Styled from './styles';

interface MascotViewProps {
  assetsBaseUrl: string;
  model: MascotModel;
  points: number;
}

// Images live in public/assets/mascots/<model>/<level>.png, one per level (1 to 10).
// While an image is missing, an emoji placeholder is shown instead.
function MascotView({ assetsBaseUrl, model, points }: MascotViewProps): React.ReactElement {
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const option = MASCOT_OPTIONS.find((o) => o.model === model);
  const imageUrl = `${assetsBaseUrl}/assets/mascots/${model}/${points}.png`;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Styled.Wrapper className="mascot-view">
      {imageFailed ? (
        <Styled.Fallback aria-hidden style={{ fontSize: `${2 + points * 0.4}rem` }}>
          {option?.fallbackEmoji}
        </Styled.Fallback>
      ) : (
        <Styled.Image
          src={imageUrl}
          alt={`${option?.label} nível ${points}`}
          onError={() => setImageFailed(true)}
        />
      )}
      <Styled.Info>
        <BBBTypography variant="selected">{option?.label}</BBBTypography>
        <BBBTypography variant="text3" className="mascot-view-level">
          {`Nível ${points}/${MAX_POINTS}`}
        </BBBTypography>
      </Styled.Info>
      <Styled.Bar
        role="progressbar"
        aria-valuemin={MIN_POINTS}
        aria-valuemax={MAX_POINTS}
        aria-valuenow={points}
        aria-label="Nível do mascote"
      >
        <Styled.BarFill style={{ width: `${(points / MAX_POINTS) * 100}%` }} />
      </Styled.Bar>
    </Styled.Wrapper>
  );
}

export default MascotView;
