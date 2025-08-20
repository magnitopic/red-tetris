import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
  default: { query: jest.fn() }
}));

const { default: gameModel } = await import('../../../src/Models/GameModel.js');


describe('GameModel', () => {
  it('should be an instance of GameModel and Model', () => {
    expect(gameModel).toBeDefined();
    expect(gameModel.constructor.name).toBe('GameModel');
    expect(Object.getPrototypeOf(gameModel).constructor.name).toBe('GameModel');
    expect(gameModel.table).toBe('games');
  });
});
