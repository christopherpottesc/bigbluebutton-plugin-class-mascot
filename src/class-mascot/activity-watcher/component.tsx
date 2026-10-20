import { useEffect, useRef } from 'react';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';

import {
  LATEST_STUDENT_MESSAGE_SUBSCRIPTION,
  LatestStudentMessage,
  ReactionsByUser,
  STUDENT_REACTIONS_SUBSCRIPTION,
  StudentReactions,
  hasNewReaction,
  reactionsByUser,
} from './detection';

interface ActivityWatcherProps {
  pluginApi: PluginApi;
  // Called with the time of the activity, in ms.
  onActivity: (at: number) => void;
}

// Watches students' public chat messages and reactions. Rendered only for moderators,
// who are the ones allowed to save the mascot state.
function ActivityWatcher({ pluginApi, onActivity }: ActivityWatcherProps): null {
  const onActivityRef = useRef(onActivity);
  onActivityRef.current = onActivity;

  const latestMessage = pluginApi.useCustomSubscription<LatestStudentMessage>(
    LATEST_STUDENT_MESSAGE_SUBSCRIPTION
  );
  const reactions = pluginApi.useCustomSubscription<StudentReactions>(
    STUDENT_REACTIONS_SUBSCRIPTION
  );

  const message = latestMessage?.data?.chat_message_public?.[0];
  useEffect(() => {
    if (!message) return;
    // Messages sent before the plugin loaded are older than the countdown and ignored.
    onActivityRef.current(Date.parse(message.createdAt));
    // Runs once per new message, identified by its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.messageId]);

  // The first snapshot is the baseline: reactions already on screen do not count.
  const previousReactions = useRef<ReactionsByUser | null>(null);
  useEffect(() => {
    if (!reactions?.data) return;
    const current = reactionsByUser(reactions.data);
    if (previousReactions.current && hasNewReaction(previousReactions.current, current)) {
      onActivityRef.current(Date.now());
    }
    previousReactions.current = current;
  }, [reactions?.data]);

  return null;
}

export default ActivityWatcher;
