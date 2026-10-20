import { hasNewReaction, reactionsByUser } from './detection';

const snapshot = (entries: [string, string | null][]) =>
  reactionsByUser({ user: entries.map(([userId, reactionEmoji]) => ({ userId, reactionEmoji })) });

describe('hasNewReaction', () => {
  it('detects a student starting a reaction', () => {
    expect(hasNewReaction(snapshot([['a', null]]), snapshot([['a', '👍']]))).toBe(true);
  });

  it('detects a student changing the reaction', () => {
    expect(hasNewReaction(snapshot([['a', '👍']]), snapshot([['a', '🎉']]))).toBe(true);
  });

  it('detects a reaction from a student who just joined', () => {
    expect(hasNewReaction(snapshot([]), snapshot([['b', '👏']]))).toBe(true);
  });

  it('ignores a reaction that is still the same', () => {
    expect(hasNewReaction(snapshot([['a', '👍']]), snapshot([['a', '👍']]))).toBe(false);
  });

  it('ignores a reaction being cleared', () => {
    expect(hasNewReaction(snapshot([['a', '👍']]), snapshot([['a', null]]))).toBe(false);
  });

  it('treats "none" as no reaction', () => {
    expect(hasNewReaction(snapshot([['a', null]]), snapshot([['a', 'none']]))).toBe(false);
  });
});
