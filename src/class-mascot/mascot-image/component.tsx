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
  // Hides the image from screen readers when a label next to it already names the mascot.
  decorative?: boolean;
}

// Images live in public/assets/mascots/<model>/<level>.png, one per level (1 to 10).
// While an image is missing, an emoji placeholder is shown instead.
function MascotImage({
  assetsBaseUrl,
  model,
  points,
  size,
  direction = null,
  decorative = false,
}: MascotImageProps): React.ReactElement {
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const option = MASCOT_OPTIONS.find((o) => o.model === model);
  const imageUrl = `${assetsBaseUrl}/assets/mascots/${model}/${points}.png`;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  // The emoji grows with the level, so the placeholder still shows the evolution.
  const emojiSize = { large: `${2 + points * 0.4}rem`, option: '2rem', small: '1.5rem' }[size];

  return (
    <Styled.Frame $size={size} $direction={direction}>
      {imageFailed ? (
        <span aria-hidden style={{ fontSize: emojiSize }}>
          {option?.fallbackEmoji}
        </span>
      ) : (
        <Styled.Image
          src={imageUrl}
          $pixelArt={option?.pixelArt ?? false}
          alt={decorative ? '' : `${option?.label} nível ${points}`}
          onError={() => setImageFailed(true)}
        />
      )}
    </Styled.Frame>
  );
}

export default MascotImage;
