import * as React from 'react';
import { useState } from 'react';
import { BBButton, BBBSlider, BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { INITIAL_POINTS, MASCOT_OPTIONS, MAX_POINTS } from '../constants';
import { MascotModel, MascotState } from '../types';
import MascotView from '../mascot-view/component';
import Styled from './styles';

const MIN_INACTIVITY_MINUTES = 1;
const MAX_INACTIVITY_MINUTES = 30;

interface ControlPanelProps {
  assetsBaseUrl: string;
  mascotState: MascotState | null;
  isReady: boolean;
  onSelectModel: (model: MascotModel) => void;
  onAddPoint: () => void;
  onChangeInactivityMinutes: (minutes: number) => void;
  onReset: () => void;
}

// Moderator settings, rendered in the sidebar panel next to the other apps.
function ControlPanel({
  assetsBaseUrl,
  mascotState,
  isReady,
  onSelectModel,
  onAddPoint,
  onChangeInactivityMinutes,
  onReset,
}: ControlPanelProps): React.ReactElement {
  const [introImageFailed, setIntroImageFailed] = useState<boolean>(false);

  return (
    <Styled.Panel data-test="class-mascot-settings">
      <Styled.Content>
        <Styled.Intro>
          {!introImageFailed && (
            <Styled.IntroImageWrapper>
              <Styled.IntroImage
                src={`${assetsBaseUrl}/assets/mascot_panel.svg`}
                alt="Mascote da turma evoluindo com a participação"
                onError={() => setIntroImageFailed(true)}
              />
            </Styled.IntroImageWrapper>
          )}
          <BBBTypography>
            O mascote da turma cresce com a participação dos alunos. A cada participação que você
            confirmar, ele ganha um ponto e evolui, do nível 1 ao 10. Se a turma ficar muito tempo
            sem participar, ele perde pontos. Todos na sala acompanham o mascote numa janela
            flutuante.
          </BBBTypography>
        </Styled.Intro>
        <Styled.Section aria-labelledby="class-mascot-models-title">
          <BBBTypography variant="selected" id="class-mascot-models-title">
            Escolha o mascote
          </BBBTypography>
          {!isReady && <BBBTypography variant="text3">Conectando à sala…</BBBTypography>}
          {mascotState?.visible === false && (
            <BBBTypography variant="text3">
              O mascote está fechado para a turma. Escolha um mascote para mostrá-lo de novo.
            </BBBTypography>
          )}
          <Styled.ModelOptions role="radiogroup" aria-labelledby="class-mascot-models-title">
            {MASCOT_OPTIONS.map((option) => {
              const selected = mascotState?.model === option.model;
              return (
                <Styled.ModelOption
                  key={option.model}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  $selected={selected}
                  disabled={!isReady}
                  onClick={() => onSelectModel(option.model)}
                >
                  <Styled.ModelEmoji aria-hidden>{option.fallbackEmoji}</Styled.ModelEmoji>
                  <BBBTypography as="span" variant={selected ? 'selected' : 'default'}>
                    {option.label}
                  </BBBTypography>
                </Styled.ModelOption>
              );
            })}
          </Styled.ModelOptions>
        </Styled.Section>

        {mascotState && (
          <>
            <Styled.Preview>
              <MascotView
                assetsBaseUrl={assetsBaseUrl}
                model={mascotState.model}
                points={mascotState.points}
              />
            </Styled.Preview>
            <BBBSlider
              label="Tempo sem participação"
              helperText={`O mascote perde 1 ponto a cada ${mascotState.inactivityMinutes} min sem participação`}
              min={MIN_INACTIVITY_MINUTES}
              max={MAX_INACTIVITY_MINUTES}
              step={1}
              value={mascotState.inactivityMinutes}
              valueLabelDisplay="auto"
              disabled={!isReady}
              onChangeCommitted={(_, minutes) => onChangeInactivityMinutes(minutes)}
            />
          </>
        )}
      </Styled.Content>

      {mascotState && (
        <Styled.Footer>
          <BBButton
            fullWidth
            variant="secondary"
            label="Reiniciar pontos"
            disabled={!isReady || mascotState.points === INITIAL_POINTS}
            onClick={onReset}
          />
          <BBButton
            fullWidth
            label="+1 ponto"
            ariaLabel="Adicionar 1 ponto de participação"
            disabled={!isReady || mascotState.points >= MAX_POINTS}
            onClick={onAddPoint}
          />
        </Styled.Footer>
      )}
    </Styled.Panel>
  );
}

export default ControlPanel;
