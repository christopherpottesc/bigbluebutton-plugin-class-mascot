import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { MdPets } from 'react-icons/md';
import * as ReactDOM from 'react-dom/client';

import {
  BbbPluginSdk,
  DataChannelTypes,
  FloatingWindow,
  GenericContentSidekickArea,
  PluginApi,
  pluginLogger,
} from 'bigbluebutton-html-plugin-sdk';
import { colors } from '@bigbluebutton/bbb-ui-components-react';
import {
  DATA_CHANNEL_NAME,
  DEFAULT_INACTIVITY_MINUTES,
  INACTIVITY_CHECK_INTERVAL_MS,
  INITIAL_POINTS,
  MAX_POINTS,
  MIN_POINTS,
} from './constants';
import { ClassMascotProps, MascotModel, MascotState } from './types';
import ControlPanel from './control-panel/component';
import { pushRelayState, useRelayState } from './relay';
import FloatingMascot from './floating-mascot/component';
import { readSavedPosition, savePositionOnDrop } from './floating-mascot/position';

const MODERATOR_ROLE = 'MODERATOR';
// BBB keeps a floating window (and where it was dragged) while its id stays the same.
const FLOATING_WINDOW_ID = 'class-mascot-floating-window';
const SETTINGS_PANEL_ID = 'class-mascot-settings';

// BBB renders floating windows and sidebar panels into elements it owns, through a
// React root the plugin creates once. Content is updated by re-rendering that root,
// as long as BBB has not unmounted it (e.g. the sidebar panel was closed).
interface ExternalRoot {
  root: ReactDOM.Root;
  element: HTMLElement;
}

function renderIfMounted(target: ExternalRoot | null, node: React.ReactElement) {
  if (target?.element.isConnected) target.root.render(node);
}

function ClassMascot({ pluginUuid: uuid, assetsBaseUrl }: ClassMascotProps): React.ReactNode {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);
  // Last state this user pushed, so the moderator's view works even if neither the
  // data channel nor the relay answer.
  const [localMascotState, setLocalMascotState] = useState<MascotState | null>(null);

  const currentUser = pluginApi.useCurrentUser();
  const usersBasicInfo = pluginApi.useUsersBasicInfo();
  const meetingData = pluginApi.useMeetingData((meeting) => ({ meetingId: meeting.meetingId }));
  const meetingId = meetingData?.data?.meetingId;
  const { data: mascotStateResponse, pushEntry: pushMascotState } =
    pluginApi.useDataChannel<MascotState>(DATA_CHANNEL_NAME, DataChannelTypes.LATEST_ITEM);

  const channelMascotState = mascotStateResponse?.data?.[0]?.payloadJson ?? null;
  // The relay is only needed while the data channel stays empty.
  const relayMascotState = useRelayState(assetsBaseUrl, meetingId, !channelMascotState);
  const newestFallbackState =
    [localMascotState, relayMascotState]
      .filter(Boolean)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? null;
  const mascotState: MascotState | null = channelMascotState ?? newestFallbackState;
  // The SDK only provides pushEntry once BBB has set up the data channel.
  const isDataChannelReady = !!pushMascotState;
  const currentUserId = currentUser?.data?.userId;
  const isModerator = currentUser?.data?.role === MODERATOR_ROLE;

  // Only one client should apply the inactivity penalty, otherwise each moderator
  // would discount a point. The moderator with the smallest userId takes the job.
  const inactivityLeaderId = usersBasicInfo?.data?.user
    ?.filter((user) => user.isModerator && !user.bot)
    .map((user) => user.userId)
    .sort()[0];
  const isInactivityLeader = isModerator && currentUserId === inactivityLeaderId;

  const pushState = (changes: Omit<MascotState, 'updatedAt'>) => {
    const state = { ...changes, updatedAt: Date.now() };
    setLocalMascotState(state);
    pushRelayState(assetsBaseUrl, meetingId, state);
    if (!pushMascotState) {
      pluginLogger.warn('Class mascot data channel is not ready, state not saved', state);
      return;
    }
    pushMascotState(state);
  };

  const updateMascotState = (changes: Partial<MascotState>) => {
    pushState({ ...mascotState, ...changes } as MascotState);
  };

  const handleSelectModel = (model: MascotModel) => {
    if (mascotState) {
      updateMascotState({ model, visible: true });
      return;
    }
    pushState({
      model,
      visible: true,
      points: INITIAL_POINTS,
      inactivityMinutes: DEFAULT_INACTIVITY_MINUTES,
      lastActivityAt: Date.now(),
    });
  };

  const handleAddPoint = () => {
    updateMascotState({
      points: Math.min(mascotState.points + 1, MAX_POINTS),
      lastActivityAt: Date.now(),
    });
  };

  const handleReset = () => {
    updateMascotState({ points: INITIAL_POINTS, lastActivityAt: Date.now() });
  };

  const handleHide = () => {
    updateMascotState({ visible: false });
  };

  const isMascotVisible = !!mascotState && mascotState.visible !== false;

  const openSettings = () => pluginApi.uiCommands?.sidekickArea.panel.open(SETTINGS_PANEL_ID);

  // Latest values for content rendered outside this component's React tree.
  const latest = useRef(null);
  latest.current = {
    mascotState,
    isModerator,
    isDataChannelReady,
    onSelectModel: handleSelectModel,
    onAddPoint: handleAddPoint,
    onReset: handleReset,
    onHide: handleHide,
    onChangeInactivityMinutes: (inactivityMinutes: number) =>
      updateMascotState({
        inactivityMinutes,
      }),
  };

  const floatingTarget = useRef<ExternalRoot | null>(null);
  const settingsTarget = useRef<ExternalRoot | null>(null);

  const renderFloatingContent = () => {
    const { mascotState: state, isModerator: moderator } = latest.current;
    if (!state) return;
    renderIfMounted(
      floatingTarget.current,
      <FloatingMascot
        assetsBaseUrl={assetsBaseUrl}
        mascotState={state}
        isModerator={moderator}
        onAddPoint={() => latest.current.onAddPoint()}
        onOpenSettings={openSettings}
        onHide={() => latest.current.onHide()}
      />
    );
  };

  const renderSettingsContent = () => {
    const { mascotState: state, isDataChannelReady: ready } = latest.current;
    renderIfMounted(
      settingsTarget.current,
      <ControlPanel
        assetsBaseUrl={assetsBaseUrl}
        mascotState={state}
        isReady={ready}
        onSelectModel={(model) => latest.current.onSelectModel(model)}
        onAddPoint={() => latest.current.onAddPoint()}
        onChangeInactivityMinutes={(minutes) => latest.current.onChangeInactivityMinutes(minutes)}
        onReset={() => latest.current.onReset()}
      />
    );
  };

  // Moderators get the settings in the sidebar, next to the other apps. BBB
  // also lists this panel in the apps gallery, so no separate gallery entry is needed.
  useEffect(() => {
    if (!isModerator) {
      settingsTarget.current = null;
      pluginApi.setGenericContentItems([]);
      return;
    }
    pluginApi.setGenericContentItems([
      new GenericContentSidekickArea({
        id: SETTINGS_PANEL_ID,
        name: 'Mascote da turma',
        section: 'Apps',
        buttonIcon: { svgContent: <MdPets /> },
        open: false,
        dataTest: 'class-mascot-sidebar-button',
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          settingsTarget.current = { root, element };
          renderSettingsContent();
          return root;
        },
      }),
    ]);
    // Registered once per role: BBB keeps the panel and its content is re-rendered
    // through settingsTarget, so the handlers do not need to be dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModerator]);

  // Everyone in the room sees the mascot once a moderator picks one. The window is
  // only created when the mascot shows up, so a +1 does not move it back.
  useEffect(() => {
    if (!isMascotVisible) {
      floatingTarget.current = null;
      pluginApi.setFloatingWindows([]);
      return;
    }
    const { top, left } = readSavedPosition();
    const floatingWindow = new FloatingWindow({
      id: FLOATING_WINDOW_ID,
      top,
      left,
      movable: true,
      backgroundColor: colors.background.white,
      boxShadow: `0 4px 16px ${colors.shadow.default}`,
      contentFunction: (element: HTMLElement) => {
        savePositionOnDrop(element);
        const root = ReactDOM.createRoot(element);
        floatingTarget.current = { root, element };
        renderFloatingContent();
        return root;
      },
    });
    pluginApi.setFloatingWindows([floatingWindow]);
    // Recreating the window on other changes would reset where it was dragged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMascotVisible]);

  useEffect(() => {
    renderFloatingContent();
    renderSettingsContent();
    // The render functions read everything from refs; these are the values they show.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mascotState, isModerator, isDataChannelReady]);

  useEffect(() => {
    // The countdown pauses while the mascot is hidden.
    if (!isInactivityLeader || !isMascotVisible) return undefined;
    const interval = setInterval(() => {
      const inactiveMs = Date.now() - mascotState.lastActivityAt;
      if (inactiveMs < mascotState.inactivityMinutes * 60 * 1000) return;
      if (mascotState.points <= MIN_POINTS) return;
      updateMascotState({
        points: mascotState.points - 1,
        lastActivityAt: Date.now(),
      });
    }, INACTIVITY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
    // updateMascotState only depends on mascotState, which is already listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInactivityLeader, isMascotVisible, mascotState]);

  return null;
}

export default ClassMascot;
