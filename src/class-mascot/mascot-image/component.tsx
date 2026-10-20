import * as React from 'react';
import { useEffect, useState } from 'react';

import { MASCOT_OPTIONS } from '../constants';
import { MascotModel } from '../types';
import { LevelDirection } from '../mascot-view/level-change';
import Styled, { MascotImageSize } from './styles';

interface MascotImageProps {
  assetsBaseUrl: string;
  model: MascotModel;
  points: number;
  size: MascotImageSize;
  // Animates the change of level when set; restart it by changing the React key.
  direction?: LevelDirection | null;
}

// Images live in public/assets/mascots/<model>/<level>.png, one per level (1 to 10).
// While an image is missing, an emoji placeholder is shown instead.
function MascotImage({
  assetsBaseUrl,
  model,
  points,
  size,
  direction = null,
}: MascotImageProps): React.ReactElement {
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const option = MASCOT_OPTIONS.find((o) => o.model === model);
  const imageUrl = `${assetsBaseUrl}/assets/mascots/${model}/${points}.png`;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  // The emoji grows with the level, so the placeholder still shows the evolution.
  const emojiSize = size === 'large' ? `${2 + points * 0.4}rem` : '1.5rem';

  return (
    <Styled.Frame $size={size} $direction={direction}>
      {imageFailed ? (
        <span aria-hidden style={{ fontSize: emojiSize }}>
          {option?.fallbackEmoji}
        </span>
      ) : (
        <Styled.Image
          src={imageUrl}
          alt={`${option?.label} nível ${points}`}
          onError={() => setImageFailed(true)}
        />
      )}
    </Styled.Frame>
  );
}

export default MascotImage;
