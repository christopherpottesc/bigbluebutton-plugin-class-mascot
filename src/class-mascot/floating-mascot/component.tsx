import * as React from 'react';
import { useState } from 'react';
import { MdAdd, MdClose, MdOpenInFull } from 'react-icons/md';
import { BBButton, BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

import { MAX_POINTS } from '../constants';
import { MascotState } from '../types';
import MascotView from '../mascot-view/component';
import Styled from './styles';

interface FloatingMascotProps {
  assetsBaseUrl: string;
  mascotState: MascotState;
  isModerator: boolean;
  onAddPoint: () => void;
  onOpenSettings: () => void;
  onHide: () => void;
}

// Content of the floating window everyone sees. Moderators also get a +1 shortcut,
// a way back to the settings modal, and can hide the mascot for the whole class.
function FloatingMascot({
  assetsBaseUrl,
  mascotState,
  isModerator,
  onAddPoint,
  onOpenSettings,
  onHide,
}: FloatingMascotProps): React.ReactElement {
  const [confirmingHide, setConfirmingHide] = useState<boolean>(false);

  return (
    <Styled.Card data-test="class-mascot-floating">
      <Styled.Header>
        <BBBTypography variant="selected">Mascote da turma</BBBTypography>
        {isModerator && !confirmingHide && (
          <Styled.HeaderActions>
            <BBButton
              layout="circle"
              variant="subtle"
              color="neutral"
              size="sm"
              icon={<MdOpenInFull />}
              ariaLabel="Abrir configurações do mascote"
              tooltipLabel="Configurações: trocar mascote, reiniciar pontos"
              dataTest="class-mascot-open-settings"
              onClick={onOpenSettings}
            />
            <BBButton
              layout="circle"
              variant="subtle"
              color="neutral"
              size="sm"
              icon={<MdClose />}
              ariaLabel="Fechar o mascote"
              tooltipLabel="Fechar o mascote"
              dataTest="class-mascot-close"
              onClick={() => setConfirmingHide(true)}
            />
          </Styled.HeaderActions>
        )}
      </Styled.Header>

      {confirmingHide ? (
        <Styled.Confirm role="alertdialog" aria-labelledby="class-mascot-confirm-title">
          <BBBTypography id="class-mascot-confirm-title">
            Fechar o mascote para toda a turma?
          </BBBTypography>
          <BBBTypography variant="text3">
            Os pontos ficam guardados. Para mostrar de novo, escolha o mascote na galeria de apps.
          </BBBTypography>
          <Styled.ConfirmActions>
            <BBButton
              variant="secondary"
              size="sm"
              label="Cancelar"
              onClick={() => setConfirmingHide(false)}
            />
            <BBButton
              color="danger"
              size="sm"
              label="Fechar"
              dataTest="class-mascot-confirm-close"
              onClick={onHide}
            />
          </Styled.ConfirmActions>
        </Styled.Confirm>
      ) : (
        <Styled.Body>
          <MascotView
            assetsBaseUrl={assetsBaseUrl}
            model={mascotState.model}
            points={mascotState.points}
          />
          {isModerator && (
            <BBButton
              size="sm"
              fullWidth
              label="1 ponto de participação"
              iconStart={<MdAdd />}
              disabled={mascotState.points >= MAX_POINTS}
              dataTest="class-mascot-add-point"
              onClick={onAddPoint}
            />
          )}
        </Styled.Body>
      )}
    </Styled.Card>
  );
}

export default FloatingMascot;
