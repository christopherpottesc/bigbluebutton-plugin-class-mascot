import { levelChangeAnnouncement } from './level-change';

describe('levelChangeAnnouncement', () => {
  it('announces a level up', () => {
    expect(levelChangeAnnouncement('Caramelo', 3, 4)).toBe('Caramelo subiu para o nível 4.');
  });

  it('celebrates the maximum level', () => {
    expect(levelChangeAnnouncement('Caramelo', 9, 10)).toBe('Caramelo chegou ao nível máximo, 10!');
  });

  it('announces a level down', () => {
    expect(levelChangeAnnouncement('Frajola', 5, 4)).toBe('Frajola caiu para o nível 4.');
  });
});
