import { useEffect, useState } from 'react';
import { pluginLogger } from 'bigbluebutton-html-plugin-sdk';

import { MascotState } from './types';

// Fallback for servers that do not persist this plugin's data
// channel, so the state also goes through the dev server that hosts the plugin
// (see webpack.config.js). Remove once the data channel works.
const RELAY_POLL_INTERVAL_MS = 2000;

function relayUrl(baseUrl: string, meetingId: string): string {
  return `${baseUrl}/state/${encodeURIComponent(meetingId)}`;
}

function pushRelayState(baseUrl: string, meetingId: string | undefined, state: MascotState): void {
  if (!meetingId) return;
  // text/plain avoids a CORS preflight; the server parses the JSON itself.
  fetch(relayUrl(baseUrl, meetingId), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(state),
  }).catch((error) => pluginLogger.warn('Class mascot relay push failed', error));
}

function useRelayState(
  baseUrl: string,
  meetingId: string | undefined,
  enabled: boolean
): MascotState | null {
  const [state, setState] = useState<MascotState | null>(null);

  useEffect(() => {
    if (!enabled || !meetingId) return undefined;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(relayUrl(baseUrl, meetingId), { cache: 'no-store' });
        if (cancelled || response.status !== 200) return;
        const next: MascotState = await response.json();
        setState((current) => (current?.updatedAt === next.updatedAt ? current : next));
      } catch {
        // Relay unavailable: keep the last known state.
      }
    };
    poll();
    const interval = setInterval(poll, RELAY_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [baseUrl, meetingId, enabled]);

  return state;
}

export { pushRelayState, useRelayState };
