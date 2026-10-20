// Student activity read from BBB's GraphQL API through custom subscriptions, since
// the plugin SDK has no hook for reactions. Field names follow BBB 3.0's schema.

const LATEST_STUDENT_MESSAGE_SUBSCRIPTION = `subscription ClassMascotLatestStudentMessage {
  chat_message_public(
    where: { senderRole: { _eq: "VIEWER" }, messageType: { _eq: "default" } }
    order_by: { createdAt: desc }
    limit: 1
  ) {
    messageId
    createdAt
  }
}`;

// reactionEmoji is null while a user has no reaction; it clears after a few seconds.
const STUDENT_REACTIONS_SUBSCRIPTION = `subscription ClassMascotStudentReactions {
  user(where: { isModerator: { _eq: false } }) {
    userId
    reactionEmoji
  }
}`;

interface LatestStudentMessage {
  chat_message_public: { messageId: string; createdAt: string }[];
}

interface StudentReactions {
  user: { userId: string; reactionEmoji: string | null }[];
}

type ReactionsByUser = Map<string, string | null>;

function reactionsByUser(data: StudentReactions | undefined): ReactionsByUser {
  return new Map((data?.user ?? []).map((u) => [u.userId, u.reactionEmoji ?? null]));
}

// True when a student started a reaction (or changed it) since the previous snapshot.
function hasNewReaction(previous: ReactionsByUser, current: ReactionsByUser): boolean {
  return Array.from(current.entries()).some(
    ([userId, emoji]) => emoji !== null && emoji !== 'none' && previous.get(userId) !== emoji
  );
}

export {
  LATEST_STUDENT_MESSAGE_SUBSCRIPTION,
  STUDENT_REACTIONS_SUBSCRIPTION,
  LatestStudentMessage,
  StudentReactions,
  ReactionsByUser,
  reactionsByUser,
  hasNewReaction,
};
